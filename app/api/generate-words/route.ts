import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
    try {
        const { category, categories, previousWords } = await request.json();

        // Support both single category (string) and multiple categories (array)
        let categoriesList: string[];
        if (categories && Array.isArray(categories) && categories.length > 0) {
            categoriesList = categories;
        } else if (category && typeof category === "string") {
            categoriesList = [category];
        } else {
            return NextResponse.json(
                { error: "Category or categories are required" },
                { status: 400 }
            );
        }

        // Check API key with better error messaging
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("OPENAI_API_KEY is missing from environment variables");
            return NextResponse.json(
                { error: "OpenAI API key not configured", details: "Environment variable OPENAI_API_KEY is not set" },
                { status: 500 }
            );
        }

        // Initialize client inside the function to ensure env vars are available
        const client = new OpenAI({
            apiKey: apiKey,
        });

        const excludeWordsText = previousWords && previousWords.length > 0
            ? `Exclude these words: ${previousWords.join(", ")}`
            : "";

        const categoryText = categoriesList.length === 1
            ? `Category: "${categoriesList[0]}"`
            : `Categories: ${categoriesList.map(c => `"${c}"`).join(", ")} (choose a word from any of these categories)`;

        const prompt = `You are a Game Content Engine for a social deduction game like "Undercover."
Your Goal: Generate a challenging secret word and a lateral thinking hint.

${categoryText}
${excludeWordsText}

---
### REQUIREMENTS
1. **The Word**: Must be a SINGLE English word related to the category.
   - If the concept usually has two words (e.g., "Ice Cream"), pick the most distinct single word (e.g., "Gelato" or "Scoop").
   - No proper nouns unless the category specifically requires them.

2. **The Hint**: Must be a SINGLE English word.
   - **Mental Model**: Do not describe *what* the object is. Describe *where* you see it, *how* it makes you feel, or *what happens* when you use it.
   - **The "Imposter Test"**: If an imposter hears this hint, they should NOT be able to immediately guess the secret word.
   - **Valid Logic**: A person who knows the secret word must instantly nod and say "Ah, that makes sense."

---
### EXAMPLES OF DIFFICULTY
❌ BAD (Too Direct/Definition):
- Word: "Shark" -> Hint: "Ocean" (Too obvious)
- Word: "Coffee" -> Hint: "Drink" (Definition)
- Word: "Sun" -> Hint: "Hot" (Basic property)

✅ GOOD (Context/Atmosphere/Consequence):
- Word: "Shark" -> Hint: "Cage" (Context)
- Word: "Coffee" -> Hint: "Jittery" (Consequence)
- Word: "Sun" -> Hint: "Tan" (Result)

---
### OUTPUT FORMAT
Return ONLY a raw JSON string.
- Do NOT use markdown code blocks (no \`\`\`)
- Do NOT add conversational text.

{"word": "String", "category": "String", "hint": "String"}`;

        let response;
        try {
            response = await client.responses.create({
                model: "gpt-5.2",
                input: prompt,
                reasoning: { effort: "medium" },
                text: { verbosity: "low" },
                temperature: 1.1,
                top_p: 0.9,
            });
        } catch (apiError: any) {
            console.error("OpenAI API call failed:", {
                message: apiError?.message,
                status: apiError?.status,
                code: apiError?.code,
                type: apiError?.type,
                error: apiError
            });
            throw new Error(`OpenAI API error: ${apiError?.message || "Unknown error"}`);
        }

        const content = response?.output_text;

        if (!content) {
            return NextResponse.json(
                { error: "No response from AI" },
                { status: 500 }
            );
        }

        // Parse the JSON response, removing any markdown code blocks if present
        let cleanContent = content.trim();
        if (cleanContent.startsWith("```")) {
            cleanContent = cleanContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }

        const result = JSON.parse(cleanContent);

        // Validate the response structure
        if (!result.word || !result.hint) {
            return NextResponse.json(
                { error: "Invalid response format from AI" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            word: result.word,
            category: result.category || categoriesList[0],
            hint: result.hint,
        });
    } catch (error) {
        console.error("Error generating word:", error);

        // Provide more detailed error information in development
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorDetails = process.env.NODE_ENV === "development"
            ? {
                message: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : undefined
            }
            : { message: errorMessage };

        return NextResponse.json(
            {
                error: "Internal server error",
                details: errorDetails
            },
            { status: 500 }
        );
    }
}

