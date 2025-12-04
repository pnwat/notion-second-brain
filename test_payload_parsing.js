// Test payload parsing
const testPayloads = [
    // Normal JSON
    '{"title":"Test","content":"Hello"}',
    // Escaped JSON (as GitHub Actions might send)
    '{\\"title\\":\\"Test\\",\\"content\\":\\"Hello\\"}',
    // Double-quoted (wrapped in quotes)
    '"{\\"title\\":\\"Test\\",\\"content\\":\\"Hello\\"}"',
];

function parsePayload(payloadStr) {
    try {
        // GitHub Actions may escape quotes, so we need to handle that
        let processedStr = payloadStr;

        // If the payload starts and ends with quotes, remove them and unescape
        if (processedStr.startsWith('"') && processedStr.endsWith('"')) {
            processedStr = processedStr.slice(1, -1).replace(/\\"/g, '"');
        }

        return JSON.parse(processedStr);
    } catch (error) {
        console.error('Failed to parse:', payloadStr);
        console.error('Error:', error.message);
        return null;
    }
}

console.log('Testing payload parsing:\n');
testPayloads.forEach((payload, index) => {
    console.log(`Test ${index + 1}:`);
    console.log('Input:', payload);
    const result = parsePayload(payload);
    console.log('Result:', result);
    console.log('');
});
