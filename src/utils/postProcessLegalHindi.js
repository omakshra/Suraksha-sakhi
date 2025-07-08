import legalDictionary from './legalDictionary.json';

export function postProcessLegalHindi(text) {
    let processedText = text;

    // Replace English terms if they leak into Hindi output
    for (const [eng, hindi] of Object.entries(legalDictionary)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        processedText = processedText.replace(regex, hindi);
    }

    // Remove extra spaces
    processedText = processedText.replace(/[ ]{2,}/g, ' ');

    // Capitalize first letter of lines
    processedText = processedText
        .split('\n')
        .map(line => line.trim().charAt(0).toUpperCase() + line.trim().slice(1))
        .join('\n');

    return processedText.trim();
}
