import JSZip from "jszip";
import { DOMParser } from "@xmldom/xmldom";

export interface Question {
    id: string
    content: string
    type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER'
    options?: string[]
    correctOptionIndex?: number
    images?: string[]
    correctAnswer: string
    explanation?: string
    solution?: string
    videoUrl?: string
    chapter?: string
    lesson?: string
    problemType?: string
    level?: string
    tags?: string[]
}

/**
 * MAIN FUNCTION: Parse .docx file using tree parsing (OMML to LaTeX)
 */
export async function parseDocxFile(file: File): Promise<Question[]> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Load document.xml
        const docXmlText = await zip.file("word/document.xml")?.async("text");
        if (!docXmlText) throw new Error("Không tìm thấy word/document.xml trong file.");

        // Load relationships (for images)
        const relsXmlText = await zip.file("word/_rels/document.xml.rels")?.async("text");
        const relsMap = parseRels(relsXmlText);

        const parser = new DOMParser();
        const doc = parser.parseFromString(docXmlText, "application/xml");

        // Extract content from paragraphs and collect images
        const imagePool: string[] = [];
        const fullContent = await processDocXml(doc, zip, relsMap, imagePool);

        // Split into structured questions and redistribute images
        return splitQuestions(fullContent, imagePool);

    } catch (error: any) {
        console.error('Error parsing DOCX:', error);
        throw new Error(error.message || 'Lỗi khi xử lý file Word. Vui lòng kiểm tra định dạng.');
    }
}

/**
 * Parse relationships to map rId to file paths
 */
function parseRels(xml: string | undefined): Record<string, string> {
    const map: Record<string, string> = {};
    if (!xml) return map;
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const rels = doc.getElementsByTagName("Relationship");
    for (let i = 0; i < rels.length; i++) {
        const id = rels[i].getAttribute("Id");
        const target = rels[i].getAttribute("Target");
        if (id && target) {
            map[id] = target;
        }
    }
    return map;
}

/**
 * Helper to normalize image paths in ZIP
 */
function normalizeImgPath(target: string): string {
    // Word targets are often relative like 'media/image1.png' or '../media/image1.png'
    // JSZip needs the full path from the zip root, usually 'word/media/image1.png'
    let path = target.replace(/\\/g, '/');
    if (path.startsWith('../')) {
        path = path.substring(3); // Remove ../
    }
    if (!path.startsWith('word/')) {
        path = 'word/' + path;
    }
    return path;
}

/**
 * Process document.xml to extract text, equations, and images
 */
async function processDocXml(doc: Document, zip: JSZip, relsMap: Record<string, string>, imagePool: string[]): Promise<string> {
    const paragraphs = doc.getElementsByTagName("w:p");
    let result = "";

    for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        let pContent = "";

        const children = p.childNodes;
        for (let j = 0; j < (children?.length || 0); j++) {
            const child = children[j] as any;
            if (!child) continue;

            if (child.nodeName === "w:r") {
                pContent += await processRun(child, zip, relsMap, imagePool);
            } else if (child.nodeName === "m:oMath" || child.nodeName === "m:oMathPara") {
                const latex = parseOMML(child);
                if (latex) {
                    pContent += ` $ \\displaystyle ${latex.trim()} $ `;
                }
            } else if (child.nodeName === "w:hyperlink") {
                const texts = child.getElementsByTagName("w:t");
                for (let k = 0; k < texts.length; k++) {
                    pContent += texts[k].textContent || "";
                }
            }
        }

        if (pContent && pContent.trim()) {
            result += pContent.trim() + "\n";
        } else if (pContent === "" && children.length > 0) {
            result += "\n";
        }
    }

    return result;
}

/**
 * Process a w:r node (Run)
 */
async function processRun(node: any, zip: JSZip, relsMap: Record<string, string>, imagePool: string[]): Promise<string> {
    let content = "";
    const texts = node.getElementsByTagName("w:t");
    const rPr = findChildByName(node, "w:rPr");

    // Check run-level properties first
    let isRunUnderlined = false;
    let isRunBold = false;

    if (rPr) {
        const u = findChildByName(rPr, "w:u");
        // w:u val can be "single", "double", etc. or just present. "none" means no underline.
        const uVal = u?.getAttribute?.("w:val");
        if (u && uVal !== "none") {
            isRunUnderlined = true;
        }

        const b = findChildByName(rPr, "w:b");
        const bVal = b?.getAttribute?.("w:val");
        if (b && bVal !== "0" && bVal !== "false" && bVal !== "off") {
            isRunBold = true;
        }
    }

    for (let i = 0; i < texts.length; i++) {
        let txt = texts[i].textContent || ""; // Đảm bảo không bị undefined

        // Re-check rPr inside loop if we want to be super safer, but usually rPr is sibling to t
        if (rPr) {
            const vertAlign = findChildByName(rPr, "w:vertAlign");
            const val = vertAlign?.getAttribute?.("w:val");

            // SỬA LỖI cm2 / S2: Chuyển superscript/subscript sang LaTeX
            if (val === "superscript") {
                txt = `$ ^{${txt}} $`; // Render số mũ bay cao lên
            } else if (val === "subscript") {
                txt = `$ _{${txt}} $`; // Render chỉ số dưới
            }
        }

        // Apply formatting markers - Use specialized markers that won't break regex
        if (isRunUnderlined) {
            // Mark with <u_mark> for logic detection, but also keep visual if needed?
            // For now, we use a special marker to detect "correct answer"
            txt = `<u_mark>${txt}</u_mark>`;
        }

        if (isRunBold) {
            txt = `<b>${txt}</b>`;
        }

        content += txt;
    }

    // Phần xử lý Drawing/Images giữ nguyên...
    const drawings = node.getElementsByTagName("w:drawing");
    for (let i = 0; i < drawings.length; i++) {
        const blips = Array.from(drawings[i].getElementsByTagName("a:blip") as HTMLCollectionOf<Element>);
        for (let blip of blips) {
            const rId = blip.getAttribute("r:embed") || blip.getAttribute("r:link");
            if (rId && relsMap[rId]) {
                const imgPath = normalizeImgPath(relsMap[rId]);
                const imgFile = zip.file(imgPath);
                if (imgFile) {
                    const imgData = await imgFile.async("base64");
                    const ext = imgPath.split('.').pop()?.toLowerCase();
                    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
                    imagePool.push(`data:${mime};base64,${imgData}`);
                    content += ` [IMG_${imagePool.length - 1}] `;
                }
            }
        }
    }
    return content;
}

/**
 * Convert OMML (Office Math Markup Language) to LaTeX
 */
function parseOMML(node: Node): string {
    if (!node) return "";
    const name = node.nodeName;

    // Hàm trợ giúp đệ quy (Đảm bảo tên hàm thống nhất)
    const getChildren = (n: Node): string => {
        let content = "";
        if (n && n.childNodes) {
            for (let i = 0; i < n.childNodes.length; i++) {
                content += parseOMML(n.childNodes[i]);
            }
        }
        return content;
    };

    switch (name) {
        // 1. Xử lý các node bao ngoài và nội dung cơ bản
        case "m:oMath":
        case "m:oMathPara":
        case "m:e":
            return getChildren(node);

        // 2. Xử lý Số mũ và Chỉ số dưới (DỨT ĐIỂM LỖI x2 -> x^2)
        case "m:ssub":    // Chỉ số dưới
        case "m:ssup":    // Chỉ số trên (Số mũ)
        case "m:ssubsup": // Cả hai
            {
                // Sử dụng findChildByName để tìm chính xác các thành phần
                const eNode = findChildByName(node, "m:e");     // Cơ số (x, y)
                const subNode = findChildByName(node, "m:sub"); // Chỉ số dưới
                const supNode = findChildByName(node, "m:sup"); // Chỉ số trên

                const base = eNode ? getChildren(eNode) : "";
                const sub = subNode ? getChildren(subNode) : "";
                const sup = supNode ? getChildren(supNode) : "";

                let res = base;
                if (sub) res += `_{${sub}}`; // Thêm dấu _ cho chỉ số dưới
                if (sup) res += `^{${sup}}`; // Thêm dấu ^ cho số mũ
                return res;
            }

        // 3. Xử lý Phân số
        case "m:f": {
            const n = findChildByName(node, "m:num");
            const d = findChildByName(node, "m:den");
            return `\\frac{${n ? getChildren(n) : ""}}{${d ? getChildren(d) : ""}}`;
        }

        // 4. Xử lý Căn thức
        case "m:rad": {
            const deg = findChildByName(node, "m:deg");
            const e = findChildByName(node, "m:e");
            return deg ? `\\sqrt[${getChildren(deg)}]{${e ? getChildren(e) : ""}}` : `\\sqrt{${e ? getChildren(e) : ""}}`;
        }

        // 5. Xử lý Tích phân / Tổng / Sigma
        case "m:nary": {
            const pr = findChildByName(node, "m:naryPr");
            let op = findChildByName(pr!, "m:chr")?.getAttribute("m:val") || "\\int";
            if (op === "∫") op = "\\int";
            const sub = findChildByName(node, "m:sub");
            const sup = findChildByName(node, "m:sup");
            const e = findChildByName(node, "m:e");
            return `${op}\\limits_{${sub ? getChildren(sub) : ""}}^{${sup ? getChildren(sup) : ""}} {${e ? getChildren(e) : ""}}`;
        }

        // 6. Xử lý Dấu ngoặc & Vạch thế cận tích phân |
        case "m:d": {
            const pr = findChildByName(node, "m:dPr");
            const beg = pr ? findChildByName(pr, "m:begChr")?.getAttribute("m:val") : "(";
            const end = pr ? findChildByName(pr, "m:endChr")?.getAttribute("m:val") : ")";
            const eNode = findChildByName(node, "m:e");
            const e = eNode ? getChildren(eNode) : "";

            if ((!beg || beg.trim() === "") && (end === "|" || end === "｜")) return `\\left. ${e} \\right|`;

            const map: any = { "{": ["\\left\\{", "\\right."], "[": ["\\left[", "\\right]"], "|": ["\\left|", "\\right|"] };
            const [l, r] = map[beg || ""] || [`\\left${beg || "("}`, `\\right${end || ")"}`];
            return `${l} ${e} ${r}`;
        }

        // 7. Xử lý Văn bản và ký tự trong công thức
        case "m:r":
        case "m:t": {
            const tNodes = (node as any).getElementsByTagName ? (node as any).getElementsByTagName("m:t") : [];
            let t = "";
            if (tNodes.length > 0) {
                for (let i = 0; i < tNodes.length; i++) t += tNodes[i].textContent;
            } else t = node.textContent || "";
            return fixGreekSpacing(t);
        }

        default:
            return getChildren(node);
    }
}

function findChildByName(node: Node, name: string): any {
    if (!node.childNodes) return null;
    const localName = name.includes(':') ? name.split(':')[1] : name;
    for (let i = 0; i < node.childNodes.length; i++) {
        const nodeName = node.childNodes[i].nodeName;
        // Khớp nếu tên đầy đủ bằng name HOẶC tên local bằng localName
        if (nodeName === name || nodeName === localName || nodeName.endsWith(':' + localName)) {
            return node.childNodes[i];
        }
    }
    return null;
}

function fixGreekSpacing(text: string): string {
    if (!text) return "";
    const symbols = [
        "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa",
        "lambda", "mu", "nu", "xi", "omicron", "pi", "rho", "sigma", "tau", "upsilon", "phi",
        "chi", "psi", "omega"
    ];
    let res = text;
    symbols.forEach(s => {
        const regex = new RegExp(`\\\\${s}(?![\\s{}])`, "g");
        res = res.replace(regex, `\\${s} `);
    });
    return res;
}

/**
 * Split content into structured Question objects and redistribute images
 */
function splitQuestions(content: string, imagePool: string[]): Question[] {
    if (!content) return [];

    // Question marker: optional <b>, Câu, space, number, optional space, separator (: or .), optional </b>
    const questionRegex = /(?:^|\n)(?:<b>)?Câu\s+(\d+)\s*[:.](?:<\/b>)?/gim;
    const segments = content.split(questionRegex);
    const questions: Question[] = [];

    for (let i = 1; i < segments.length; i += 2) {
        const index = parseInt(segments[i]);
        const block = segments[i + 1] || "";

        // Tag-aware Solution marker: Look for "Lời giải" ignoring internal tags
        const solutionKeyword = /(?:<b>)?Lời(?:<[^>]+>|\s)*giải[:.]?(?:<\/b>)?/i;
        const solMatch = block.match(solutionKeyword);
        let mainContent = block;
        let solution = "";

        if (solMatch && solMatch.index !== undefined) {
            mainContent = block.substring(0, solMatch.index).trim();
            solution = block.substring(solMatch.index + solMatch[0].length).trim();
        }

        const { stem, options, type, correctOptionIndex, correctAnswers } = extractOptionsAndType(mainContent);

        // Redistribute images for this specific question
        const questionText = stem + options.join("") + solution;
        const imgMatches = questionText.match(/\[IMG_(\d+)\]/g) || [];

        const uniqueMatches = Array.from(new Set(imgMatches));
        const questionImages: string[] = [];

        let redistributedContent = stem;
        const redistributedOptions = [...options];
        let redistributedSolution = solution;

        uniqueMatches.forEach((match) => {
            const poolIndex = parseInt(match.match(/\d+/)![0]);
            const base64 = imagePool[poolIndex];
            if (base64) {
                const newIdx = questionImages.length;
                questionImages.push(base64);

                const replacement = `[IMG_${newIdx}]`;
                redistributedContent = redistributedContent.split(match).join(replacement);
                redistributedSolution = redistributedSolution.split(match).join(replacement);
                for (let j = 0; j < redistributedOptions.length; j++) {
                    redistributedOptions[j] = redistributedOptions[j].split(match).join(replacement);
                }
            }
        });

        // Determine correct answer string
        let correctAnswer = "";
        if (type === "MCQ" && correctOptionIndex !== undefined) {
            correctAnswer = String.fromCharCode(65 + correctOptionIndex); // A, B, C, D
        } else if (type === "TRUE_FALSE" && correctAnswers) {
            correctAnswer = correctAnswers.join(","); // Đ,S,Đ,S
        }

        questions.push({
            id: `q-${index}`,
            content: cleanContent(redistributedContent),
            options: redistributedOptions.map(opt => cleanContent(opt)),
            type: type,
            correctAnswer,
            correctOptionIndex,
            explanation: cleanContent(redistributedSolution),
            solution: cleanContent(redistributedSolution),
            images: questionImages,
            level: "", // Init defaults
            tags: []
        });
    }

    return questions;
}

function extractOptionsAndType(text: string): { stem: string; options: string[]; type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER", correctOptionIndex?: number, correctAnswers?: string[] } {
    if (!text) return { stem: "", options: [], type: "SHORT_ANSWER" };

    // 1. Detect True/False (Priority)
    // Robust Regex to handle marks around options: 
    // Matches: a)  or  <u_mark>a)</u_mark>  or  <b>a)</b>
    // We look for [a-d] followed by ) but allowing for opening/closing tags and whitespace complexity
    const tfRegex = /(?:(?:<[^>]+>|&nbsp;|\s)*|^)([a-d])\)(?:(?:<\/[^>]+>|&nbsp;|\s)*)/gim;
    const tfMatches = [...text.matchAll(tfRegex)];

    // 2. Detect MCQ
    // Matches: A. B. C. D. with potential bold/underline tags
    const mcqRegex = /<(?:u_mark|b|strong|span)[^>]*>(?:\s*<[^>]+>)*\s*([A-D])\s*(?:<[^>]+>)*\s*[.)]\s*(?:<\/[^>]+>)*|(?:\s|^)([A-D])\s*[.)]\s+/gim;
    const mcqMatches = [...text.matchAll(mcqRegex)];

    // Decision Logic
    if (tfMatches.length >= 2) {
        return processOptions(text, tfMatches, "TRUE_FALSE");
    } else if (mcqMatches.length >= 2) {
        return processOptions(text, mcqMatches, "MCQ");
    }

    return { stem: text, options: [], type: "SHORT_ANSWER" };
}

function processOptions(text: string, matches: RegExpMatchArray[], type: "MCQ" | "TRUE_FALSE") {
    // Stem is everything before the first option match
    const stem = text.substring(0, matches[0].index || 0).trim();
    const rawOptions: string[] = [];

    for (let i = 0; i < matches.length; i++) {
        // Start of this option content is: match index + match length
        const start = (matches[i].index || 0) + matches[i][0].length;
        // End is either start of next option or end of text
        const end = (i < matches.length - 1) ? (matches[i + 1].index || text.length) : text.length;

        // We capture the raw content including tags for answer detection logic
        rawOptions.push(text.substring(start, end).trim());
    }

    if (type === "MCQ") {
        let correctIdx = undefined;
        for (let j = 0; j < rawOptions.length; j++) {
            // Check for our custom marker <u_mark> OR legacy text-decoration 
            // Also detection if the LETTER ITSELF was underlined (which means it's inside the match, 
            // but our current logic slices *after* the match). 
            // If the user formatted just the "A." as underlined, our regex consumes it.
            // Let's check the match string for underline too if possible?
            // "matches[j]" is the regex match object. matches[j][0] is the full match string.
            const isMatchUnderlined = matches[j][0].includes('<u_mark>') || matches[j][0].includes('underline');
            const isContentUnderlined = rawOptions[j].includes('<u_mark>') || rawOptions[j].includes('text-decoration: underline');

            if (isMatchUnderlined || isContentUnderlined) {
                correctIdx = j;
                break;
            }
        }
        return {
            stem,
            options: rawOptions.map(cleanContent), // remove <u_mark> etc
            type,
            correctOptionIndex: correctIdx
        };
    } else {
        // TRUE_FALSE
        const correctAnswers = [];
        for (let i = 0; i < rawOptions.length; i++) {
            // Check underline in match ("a)") or content
            const isMatchUnderlined = matches[i][0].includes('<u_mark>') || matches[i][0].includes('underline');
            const isContentUnderlined = rawOptions[i].includes('<u_mark>') || rawOptions[i].includes('text-decoration: underline');

            if (isMatchUnderlined || isContentUnderlined) {
                correctAnswers.push("Đ");
            } else {
                correctAnswers.push("S");
            }
        }
        return {
            stem,
            options: rawOptions.map(cleanContent),
            type,
            correctAnswers
        };
    }
}

function cleanContent(text: string | null | undefined): string {
    if (!text) return "";

    let cleaned = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // XÓA SẠCH KÝ TỰ THỪA: Xóa các thẻ HTML rác và dấu chấm/khoảng trắng ở đầu/cuối
        .replace(/^[\s.．]+/, '')
        .replace(/[\s.．]+$/, '')
        // Xóa dấu hiệu gạch chân tạm thời
        .replace(/<\/?u_correct>/g, '')
        .trim();

    // Fix lỗi hiển thị LaTeX
    cleaned = cleaned.replace(/\$(.*?)\$/g, (match, formula) => {
        const f = formula ? formula.trim() : "";
        if (f) {
            const pureFormula = f.replace(/\\displaystyle\s*/g, "");
            if (pureFormula.includes('&') && !pureFormula.includes('\\begin{')) {
                return `$ \\displaystyle \\begin{aligned} ${pureFormula} \\end{aligned} $`;
            }
            return `$ \\displaystyle ${pureFormula} $`;
        }
        return match;
    });

    return cleaned;
}

function findChildByLocalName(node: Node, localName: string): any {
    if (!node.childNodes) return null;
    for (let i = 0; i < node.childNodes.length; i++) {
        const nodeName = node.childNodes[i].nodeName;
        // Kiểm tra nếu tên node kết thúc bằng localName (bỏ qua m:, w:, etc.)
        if (nodeName === localName || nodeName.endsWith(":" + localName)) {
            return node.childNodes[i];
        }
    }
    return null;
}