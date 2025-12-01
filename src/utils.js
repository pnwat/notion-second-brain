/**
 * Splits text into chunks of a specified maximum length.
 * @param {string} text - The text to split.
 * @param {number} maxLength - The maximum length of each chunk (default: 2000).
 * @returns {string[]} - An array of text chunks.
 */
function splitText(text, maxLength = 2000) {
    if (!text) return [];
    if (text.length <= maxLength) return [text];

    const chunks = [];
    let currentChunk = '';

    const lines = text.split('\n');

    for (const line of lines) {
        // If a single line is too long, split it by character
        if (line.length > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = '';
            }

            let remainingLine = line;
            while (remainingLine.length > 0) {
                chunks.push(remainingLine.slice(0, maxLength));
                remainingLine = remainingLine.slice(maxLength);
            }
        } else {
            // Check if adding the line would exceed the limit
            // +1 for the newline character that was removed by split
            if (currentChunk.length + line.length + 1 > maxLength) {
                chunks.push(currentChunk);
                currentChunk = line;
            } else {
                currentChunk = currentChunk ? currentChunk + '\n' + line : line;
            }
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}

module.exports = { splitText };
