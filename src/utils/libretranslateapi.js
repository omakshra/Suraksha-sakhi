export const translateTextWithLibre = async (text, source = "en", target = "hi") => {
    try {
        const response = await fetch("https://libretranslate.de/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                q: text,
                source: source,
                target: target,
                format: "text"
            }),
        });

        if (!response.ok) {
            console.error("LibreTranslate API error:", response.statusText);
            return text; // fallback to original if error
        }

        const data = await response.json();
        return data.translatedText || text; // fallback to original if no translated text
    } catch (error) {
        console.error("LibreTranslate fetch error:", error);
        return text; // fallback to original if fetch fails
    }
};
