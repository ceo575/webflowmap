import mammoth from 'mammoth'

export interface ParsedQuestion {
    id: string
    content: string
    type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER'
    options?: string[]
    correctAnswer?: string
    explanation?: string
    imageBase64?: string
}

/**
 * Parse Word document (.docx) to extract questions
 * Expects format: "Câu 1:", "Câu 2:", etc.
 * Choices: A., B., C., D.
 * Solution: "Lời giải" or "Đáp án"
 */
export async function parseWordFile(file: File): Promise<ParsedQuestion[]> {
    try {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()

        // Mammoth in Node.js environments often prefers Buffer over ArrayBuffer
        const buffer = Buffer.from(arrayBuffer)

        // Extract HTML and images using mammoth
        const result = await mammoth.convertToHtml({
            buffer,
        }, {
            convertImage: mammoth.images.imgElement((image) => {
                return image.read("base64").then((imageBuffer) => {
                    return {
                        src: `data:${image.contentType};base64,${imageBuffer}`
                    }
                })
            })
        })

        const html = result.value

        // Log warnings to server console for debugging
        if (result.messages.length > 0) {
            console.warn('Mammoth warnings:', result.messages)
        }

        // Parse HTML to extract questions
        const questions = extractQuestionsFromHtml(html)

        return questions

    } catch (error: any) {
        console.error('Error parsing Word file:', error)
        // Throw the specific error message instead of generic one
        throw new Error(error.message || 'Không thể đọc file Word. Vui lòng kiểm tra định dạng file.')
    }
}

/**
 * Extract questions from HTML content by splitting into blocks
 * Strives to preserve HTML structure (like images) within the question content
 */
function extractQuestionsFromHtml(html: string): ParsedQuestion[] {
    // 1. Pre-process HTML to normalize question markers while keeping tags
    // We want to find "Câu X:" even if it's split across tags like <strong>Câu</strong> 1:
    // This is hard with regex on HTML. 
    // Instead, let's work on a version where we've replaced <p> with newlines but kept <img>
    const processedHtml = html
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '') // Remove closing <p> to avoid double spacing

    // 2. Identify question starts in the processed text (ignoring tags for matching)
    // We use a regex that matches "Câu X:" possibly with tags inside
    // e.g. <p><strong>Câu 1:</strong> text</p>
    const questionStartRegex = /(?:^|\n|>)\s*(?:<[^>]+>)*\s*Câu\s+(\d+)[:\.]?\s*(?:<\/[^>]+>)*\s*/gi

    const matches = []
    let match
    while ((match = questionStartRegex.exec(processedHtml)) !== null) {
        matches.push({
            index: match.index,
            number: match[1],
            length: match[0].length,
            fullMatch: match[0]
        })
    }

    if (matches.length === 0) {
        // Log the first bit of HTML to help debugging
        console.error('No questions found. HTML start:', processedHtml.substring(0, 500))
        throw new Error('Không tìm thấy câu hỏi nào. Định dạng chuẩn là "Câu 1:", "Câu 2:"...')
    }

    const questions: ParsedQuestion[] = []

    for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i]
        const nextMatch = matches[i + 1]

        const startIndex = currentMatch.index + currentMatch.length
        const endIndex = nextMatch ? nextMatch.index : processedHtml.length

        const blockHtml = processedHtml.substring(startIndex, endIndex).trim()

        // 3. Clean up the block HTML but KEEP <img> tags
        // We also want to strip most other tags but keep the text
        let blockContent = blockHtml
            .replace(/<(?!img|br|p|\/p)[^>]+>/gi, '') // Strip all tags except img, br, p
            .trim()

        // 4. Parse choices from this block
        // Since choices (A., B., C., D.) are also likely in HTML, we clean them for matching
        const cleanContentForParsing = blockContent
            .replace(/<[^>]+>/g, ' ') // Strip all for choice detection
            .replace(/&nbsp;/g, ' ')
            .trim()

        const parsed = parseQuestionBlock(cleanContentForParsing, currentMatch.number)

        // 5. Update content: if it's MCQ, we might have images in the stem
        // For now, let's just use the blockContent as the main content
        // BUT we need to extract the Stem (text before choices) if it's MCQ
        if (parsed.type === 'MCQ' && parsed.options) {
            // Find the index of choice A in the blockHtml
            // This is tricky because blockHtml has tags. 
            // We'll use a simpler heuristic: if there's an image, it belongs to the question
            parsed.content = blockContent.split(/\s*A[.\)]/)[0].trim()
        } else {
            parsed.content = blockContent
        }

        // 6. Handle Images: If there's an <img> tag, mammoth has already base64'd it.
        // We extract the first one for the imageBase64 field (for UI compatibility)
        // AND keep it in the content (for "đúng chỗ" requirement if UI supports it)
        const imgMatch = blockHtml.match(/<img[^>]+src="([^">]+)"/i)
        if (imgMatch) {
            parsed.imageBase64 = imgMatch[1]
        }

        questions.push(parsed)
    }

    return questions
}

/**
 * Parse individual question block (text-based)
 */
function parseQuestionBlock(block: string, questionNumber: string): ParsedQuestion {
    const question: ParsedQuestion = {
        id: `q-${questionNumber}`,
        content: '',
        type: 'MCQ',
    }

    // Split by choice pattern (A., B., C., D.)
    // Look for lines starting with A., B., C., D.
    const choiceRegex = /^\s*([A-D])[.\)]\s*/gm
    const choiceMatches = [...block.matchAll(choiceRegex)]

    if (choiceMatches.length >= 2) {
        question.type = 'MCQ'

        // Content is before first choice
        const firstChoiceIndex = choiceMatches[0].index!
        question.content = block.substring(0, firstChoiceIndex).trim()

        // Extract choices
        const options: string[] = []
        for (let i = 0; i < choiceMatches.length; i++) {
            const currentChoice = choiceMatches[i]
            const nextChoice = choiceMatches[i + 1]

            const startIndex = currentChoice.index! + currentChoice[0].length
            const endIndex = nextChoice ? nextMatch(block, nextChoice.index!) : block.length

            let choiceText = block.substring(startIndex, endIndex).trim()

            // Further clean choice text from metadata like "Lời giải", "Đáp án"
            choiceText = choiceText.split(/Lời giải|Đáp án|Giải:|Chọn/i)[0].trim()
            options.push(choiceText)
        }
        question.options = options

        // Try to find correct answer
        const correctAnswerMatch = block.match(/(?:Đáp án|Chọn|Phương án chọn)\s*:?\s*([A-D])/i)
        if (correctAnswerMatch) {
            question.correctAnswer = correctAnswerMatch[1].toUpperCase()
        }

        // Extract explanation
        const explanationMatch = block.match(/(?:Lời giải|Giải|Hướng dẫn):\s*([\s\S]+)/i)
        if (explanationMatch) {
            question.explanation = explanationMatch[1].trim()
        }

    } else {
        question.type = 'SHORT_ANSWER'
        question.content = block.trim()
    }

    return question
}

/**
 * Helper to find proper end index for a choice
 */
function nextMatch(block: string, index: number): number {
    return index
}

/**
 * Preserve LaTeX formulas (wrapped in $ or $$)
 * This is a placeholder - actual implementation would need more sophisticated parsing
 */
function preserveLatex(text: string): string {
    // In a real implementation, you'd want to detect and preserve LaTeX
    // For now, just return the text as-is
    return text
}
