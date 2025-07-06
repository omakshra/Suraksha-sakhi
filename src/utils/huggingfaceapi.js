// src/utils/huggingfaceapi.js

export async function translateTextWithHF(text, sourceLang = 'en', targetLang = 'hi') {
    const apiUrl = 'https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-hi';
    const headers = {
        Authorization: `Bearer ${process.env.REACT_APP_HF_API_KEY}`,
        'Content-Type': 'application/json',
    };

    const payload = { inputs: text };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('HF API error:', response.status, await response.text());
            return text; // fallback to original text on error
        }

        const data = await response.json();
        return data[0]?.translation_text || text;
    } catch (error) {
        console.error('HF API call failed:', error);
        return text; // fallback
    }
}
