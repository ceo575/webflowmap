import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY NOT FOUND");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Listing models...");
        // This is a common way to check connectivity and models
        // Note: SDK might not have a direct listModels but we can try common ones
        const modelNames = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-2.0-flash-exp",
            "gemini-2.0-flash-001"
        ];

        for (const name of modelNames) {
            try {
                const model = genAI.getGenerativeModel({ model: name });
                const result = await model.generateContent("test");
                if (result.response) {
                    console.log(`✅ Model ${name} is AVAILABLE`);
                }
            } catch (e: any) {
                console.log(`❌ Model ${name} is NOT available (${e.status || e.message})`);
            }
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
