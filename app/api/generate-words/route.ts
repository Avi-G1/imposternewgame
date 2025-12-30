import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { category, previousWords } = await request.json();

        if (!category || typeof category !== "string") {
            return NextResponse.json(
                { error: "Category is required and must be a string" },
                { status: 400 }
            );
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key not configured" },
                { status: 500 }
            );
        }

        const excludeWordsText = previousWords && previousWords.length > 0
            ? `Exclude these words: ${previousWords.join(", ")}`
            : "";

        const prompt = `You are a Game Content Engine for a social deduction game like "Undercover."
Your Goal: Generate a challenging secret word and a lateral thinking hint.

Category: "${category}"
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

{"word": "String", "category": "${category}", "hint": "String"}`;

        const response = await client.responses.create({
            model: "gpt-5.2",
            input: prompt,
            reasoning: { effort: "medium" },
            text: { verbosity: "low" },
            temperature: 1.1,
            top_p: 0.9,
        });

        const content = response.output_text;

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
            category: result.category || category,
            hint: result.hint,
        });
    } catch (error) {
        console.error("Error generating word:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

