// src/utils/summarizeWithHF.js

export async function summarizeTextWithHF(text) {
    const HF_API_KEY = process.env.REACT_APP_HF_API_KEY;

    // Prepend a short guidance text inline to help the model capture important points
    const prompt = `Summarize clearly with these focus points: who are the parties, loan amount, repayment terms, collateral, and important dates.\n\n${text}`;

    const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${HF_API_KEY}`,
            },
            body: JSON.stringify({
                inputs: prompt,
                options: { wait_for_model: true }
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("HF API error:", errorText);
        throw new Error("Hugging Face API summarization failed.");
    }

    const data = await response.json();
    console.log("HF API summarization result:", data);

    const summary = data[0]?.summary_text || "No summary generated.";

    // Optional bullet format for your textarea display
    const bulletSummary = "• " + summary.replace(/\. /g, ".\n• ");

    return bulletSummary;
}
