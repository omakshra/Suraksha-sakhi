// src/utils/huggingfaceAPI.js

export async function translateText(text, sourceLangCode, targetLangCode) {
    const hfApiKey = process.env.REACT_APP_HF_API_KEY;
     const modelName = `Helsinki-NLP/opus-mt-${sourceLangCode}-${targetLangCode}`;
    const API_URL = `https://api-inference.huggingface.co/models/${modelName}`;
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${hfApiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: text
        })
    });

    const data = await response.json();
    if (data.error) {
        console.error("Translation error:", data.error);
        return text; // fallback to original text
    }
    return data[0].translation_text;
}
