import mammoth from "mammoth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Question {
    index: number;
    content: string;     // Question content (HTML + LaTeX)
    options: string[];   // MCQ options (A,B,C,D) or True/False (a,b,c,d) or empty
    solution: string;    // Detailed solution
    video_url: string;
    tags: string[];
    imageBase64?: string; // Attached image (if exists)
}

interface ImageData {
    id: string;
    base64: string;
    contentType: string;
}

/**
 * MAIN FUNCTION: Parse .docx file using Gemini AI for LaTeX conversion
 */
export async function parseDocxFile(file: File): Promise<Question[]> {
    try {
        const arrayBuffer = await file.arrayBuffer();

        // Step 1: Extract plain text and images from Word document
        const { text, images } = await extractDocxContent(arrayBuffer);

        // Step 2: Convert to LaTeX using Gemini AI
        const latexContent = await convertWithGemini(text);

        // Step 3: Merge images back into content
        const contentWithImages = mergeImages(latexContent, images);

        // Step 4: Split into structured questions
        return splitQuestions(contentWithImages);

    } catch (error: any) {
        console.error('Error parsing DOCX:', error);
        throw new Error(error.message || 'Lỗi khi xử lý file Word. Vui lòng kiểm tra định dạng.');
    }
}

/**
 * Extract plain text and images from DOCX file
 */
async function extractDocxContent(arrayBuffer: ArrayBuffer): Promise<{
    text: string;
    images: Map<string, ImageData>;
}> {
    const images = new Map<string, ImageData>();
    let imageCounter = 0;

    const options = {
        convertImage: mammoth.images.imgElement((image: any) => {
            return image.read("base64").then((imageBuffer: any) => {
                const imageId = `IMG_${imageCounter++}`;
                images.set(imageId, {
                    id: imageId,
                    base64: imageBuffer,
                    contentType: image.contentType || 'image/png'
                });
                // Insert placeholder in text
                return {
                    src: `[IMAGE:${imageId}]`
                };
            });
        }),
        ignoreEmptyParagraphs: false
    };

    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.convertToHtml({ buffer }, options);

    // Clean HTML to plain text (keep structure with newlines)
    let text = result.value
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')  // Remove all HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

    return { text, images };
}

/**
 * Convert text content to LaTeX using Gemini 1.5 Flash
 */
async function convertWithGemini(text: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
        throw new Error('GEMINI_API_KEY chưa được cấu hình trong file .env');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // gemini-2.0-flash is available (returned 429 in tests instead of 404)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Bạn là chuyên gia chuyển đổi nội dung đề thi sang định dạng LaTeX.

NHIỆM VỤ: Chuyển đổi nội dung đề thi sau sang LaTeX, giữ nguyên cấu trúc và hình ảnh.

QUY TẮC:
1. Sử dụng $...$ cho công thức toán học inline
2. Sử dụng $$...$$ cho công thức display (độc lập một dòng)
3. GIỮ NGUYÊN văn bản tiếng Việt, không dịch sang tiếng Anh
4. GIỮ NGUYÊN các marker hình ảnh dạng [IMAGE:xxx] đúng vị trí
5. GIỮ NGUYÊN cấu trúc câu hỏi:
   - "Câu X:" đánh dấu đầu câu hỏi
   - A. B. C. D. cho trắc nghiệm 4 đáp án
   - a. b. c. d. cho câu đúng/sai
   - "Lời giải" đánh dấu phần lời giải
6. Chuyển đổi MathType/công thức Word sang LaTeX CHÍNH XÁC

NỘI DUNG CẦN CHUYỂN ĐỔI:

${text}

CHỈ TRẢ VỀ NỘI DUNG ĐÃ CHUYỂN ĐỔI, KHÔNG THÊM GHI CHÚ HAY GIẢI THÍCH.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error: any) {
        console.error('Gemini API error:', error);
        throw new Error(`Lỗi khi gọi Gemini API: ${error.message}`);
    }
}

/**
 * Merge images back into LaTeX content at correct positions
 */
function mergeImages(latex: string, images: Map<string, ImageData>): string {
    let result = latex;

    images.forEach((imageData, imageId) => {
        const marker = `[IMAGE:${imageId}]`;
        const imgTag = `<img src="data:${imageData.contentType};base64,${imageData.base64}" alt="Image" />`;
        result = result.replace(new RegExp(marker, 'g'), imgTag);
    });

    return result;
}

/**
 * Split content into structured Question objects
 */
function splitQuestions(content: string): Question[] {
    // Find all "Câu" markers (ignore numbering, we'll re-index)
    const questionRegex = /(?:^|\n)\s*Câu\s+\d+[:.]/gim;

    const matches = [...content.matchAll(questionRegex)];

    if (matches.length === 0) {
        throw new Error('Không tìm thấy câu hỏi nào. Vui lòng đảm bảo file có dạng "Câu 1:", "Câu 2:", ...');
    }

    const questions: Question[] = [];

    for (let i = 0; i < matches.length; i++) {
        const startIdx = matches[i].index! + matches[i][0].length;
        const endIdx = (i < matches.length - 1) ? matches[i + 1].index! : content.length;

        let questionBlock = content.substring(startIdx, endIdx).trim();

        // Extract solution (if exists)
        const solutionRegex = /(?:Lời\s+giải|Hướng\s+dẫn\s+giải)[:.]/i;
        const solutionMatch = questionBlock.match(solutionRegex);

        let mainContent = questionBlock;
        let solution = "";

        if (solutionMatch) {
            const solIdx = solutionMatch.index!;
            mainContent = questionBlock.substring(0, solIdx).trim();
            solution = questionBlock.substring(solIdx + solutionMatch[0].length).trim();
        }

        // Extract options
        const { stem, options } = extractOptions(mainContent);

        // Extract first image (if exists)
        const imgMatch = stem.match(/<img[^>]+src="([^">]+)"/i);

        questions.push({
            index: i + 1,  // Re-index from 1
            content: cleanContent(stem),
            options: options.map(opt => cleanContent(opt)),
            solution: cleanContent(solution),
            video_url: "",
            tags: [],
            imageBase64: imgMatch ? imgMatch[1] : undefined
        });
    }

    return questions;
}

/**
 * Extract MCQ/True-False options from question content
 */
function extractOptions(text: string): { stem: string; options: string[] } {
    // Try MCQ pattern (A. B. C. D.)
    const mcqRegex = /(?:^|\n)\s*([A-D])[.)]\s+/gm;
    const mcqMatches = [...text.matchAll(mcqRegex)];

    if (mcqMatches.length >= 2) {
        const firstIdx = mcqMatches[0].index!;
        const stem = text.substring(0, firstIdx).trim();
        const options: string[] = [];

        for (let i = 0; i < mcqMatches.length; i++) {
            const start = mcqMatches[i].index! + mcqMatches[i][0].length;
            const end = (i < mcqMatches.length - 1) ? mcqMatches[i + 1].index! : text.length;
            options.push(text.substring(start, end).trim());
        }

        return { stem, options };
    }

    // Try True/False pattern (a. b. c. d.)
    const tfRegex = /(?:^|\n)\s*([a-d])[.)]\s+/gm;
    const tfMatches = [...text.matchAll(tfRegex)];

    if (tfMatches.length >= 2) {
        const firstIdx = tfMatches[0].index!;
        const stem = text.substring(0, firstIdx).trim();
        const options: string[] = [];

        for (let i = 0; i < tfMatches.length; i++) {
            const start = tfMatches[i].index! + tfMatches[i][0].length;
            const end = (i < tfMatches.length - 1) ? tfMatches[i + 1].index! : text.length;
            options.push(text.substring(start, end).trim());
        }

        return { stem, options };
    }

    // No options found (fill-in-blank question)
    return { stem: text, options: [] };
}

/**
 * Clean content: remove extra whitespace, normalize LaTeX
 */
function cleanContent(text: string): string {
    if (!text) return "";

    return text
        .replace(/\n\s*\n/g, '\n')     // Collapse multiple newlines
        .replace(/[ \t]+/g, ' ')       // Collapse spaces
        .trim();
}