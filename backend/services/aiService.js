import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const analyzeDataWithGroq = async (data) => {
    const { code, error, solution } = data;

    const prompt = `
        Analyze the following developer error submission. Based on the code, error, and solution, provide the following information in a VALID JSON format:
        1. "title": A concise, descriptive title for this dataset (max 15 words).
        2. "summary": A brief, one-paragraph summary explaining the problem and solution.
        3. "attributes": An array of key-value objects for "Language", "Platform/Library", and "ErrorType".
        4. "complexityScore": An integer between 1 and 100 representing the complexity.
        5. "fullAnalysis": A detailed, markdown-formatted explanation of the root cause and the fix.

        Example JSON output:
        {
            "title": "React State Hydration Mismatch on Server-Side Rendered App",
            "summary": "This dataset addresses a common hydration error in Next.js where server-generated timestamps caused a mismatch with the client-side render. The solution involves ensuring the component only renders the dynamic time on the client side using the useEffect hook.",
            "attributes": [
                {"trait_type": "Language", "value": "JavaScript"},
                {"trait_type": "Platform/Library", "value": "React (Next.js)"},
                {"trait_type": "ErrorType", "value": "Hydration Error"}
            ],
            "complexityScore": 75,
            "fullAnalysis": "### Root Cause\\nThe error 'Text content does not match server-rendered HTML' occurs because..."
        }

        ---
        SUBMISSION DATA:
        Code: ${code}
        Error: ${error}
        Solution: ${solution}
        ---
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            // --- THIS IS THE ONLY LINE THAT CHANGED ---
            model: 'deepseek-r1-distill-llama-70b', // Updated from the decommissioned 8b model
            temperature: 0.3,
            response_format: { type: "json_object" },
        });

        const responseJson = chatCompletion.choices[0]?.message?.content;
        return JSON.parse(responseJson);
    } catch (error) {
        console.error("Error communicating with Groq AI:", error);
        throw new Error("Failed to analyze data with AI.");
    }
}

