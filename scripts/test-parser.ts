import { parseDocxFile } from "../src/lib/docx-parser";
import fs from "fs";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env
config();

async function runTest() {
    const filePath = "F:/Tài liệu dạy/2009/Chương 4/mẫu equa.docx";

    if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        return;
    }

    console.log("Reading file...");
    const buffer = fs.readFileSync(filePath);

    // In Node.js environment, we might need a Blob/File polyfill or use the one provided by Node 20+
    // Since we are running with tsx/node, we can use the global File if available
    const file = new File([buffer], "mẫu equa.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }) as unknown as File;

    console.log("Calling parseDocxFile (this involves Gemini API)...");

    try {
        const questions = await parseDocxFile(file);
        console.log("\n--- PARSING SUCCESSFUL ---");
        console.log("Number of questions found:", questions.length);

        questions.forEach((q, i) => {
            console.log(`\nQuestion ${i + 1}:`);
            console.log("Content:", q.content);
            console.log("Options:", q.options);
            console.log("Solution:", q.explanation ? "FOUND" : "NOT FOUND");
        });

    } catch (error) {
        console.error("\n--- PARSING FAILED ---");
        console.error(error);
    }
}

runTest();
