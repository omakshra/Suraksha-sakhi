export function extractFieldsFromText(text) {
    const lines = text.split('\n');
    const fields = {};

    lines.forEach(line => {
        const match = line.match(/^(.+?):\s*(.*)$/);
        if (match) {
            const label = match[1].trim();
            const value = match[2].trim();
            if (value === '' || /^[-_]{2,}$/.test(value)) {
                fields[label] = '';
            }
        }
    });

    return fields;
}
