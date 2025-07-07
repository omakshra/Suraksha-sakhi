import { postProcessLegalHindi } from './postProcessLegalHindi';

const HF_API_KEY = process.env.REACT_APP_HF_API_KEY;

export async function translateTextWithHF(text, sourceLang = 'en', targetLang = 'hi') {
    if (targetLang === 'en') return text;

    let model;
    if (sourceLang === 'en' && targetLang === 'hi') {
        model = 'Helsinki-NLP/opus-mt-en-hi';
    } else if (sourceLang === 'hi' && targetLang === 'en') {
        model = 'Helsinki-NLP/opus-mt-hi-en';
    } else {
        console.error(`Translation model for ${sourceLang} -> ${targetLang} not configured.`);
        return text;
    }

    const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
    const headers = {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
    };

    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    const translatedLines = [];

    for (const line of lines) {
        try {
            const payload = { inputs: line };
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error('HF API error:', response.status, await response.text());
                translatedLines.push(line);
                continue;
            }

            const data = await response.json();
            const translatedText = Array.isArray(data) ? data[0]?.translation_text : data.translation_text;
            translatedLines.push(translatedText || line);
        } catch (error) {
            console.error('HF API call failed:', error);
            translatedLines.push(line);
        }
    }

    const finalTranslation = translatedLines.join('\n');
    return targetLang === 'hi' ? postProcessLegalHindi(finalTranslation) : finalTranslation;
}
