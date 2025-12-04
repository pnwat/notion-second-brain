const { formatMarkdown } = require('./src/utils/markdownFormatter');

async function testFormatting() {
    console.log('=== Testing AI Formatting ===\n');

    // Test 1: Heading Normalization
    const badHeadings = `
### H3 Start

## H2

##### H5 Jump
`;
    console.log('--- Test 1: Heading Normalization ---');
    console.log('Input:', badHeadings.trim());
    const formattedHeadings = await formatMarkdown(badHeadings);
    console.log('Output:', formattedHeadings.trim());
    console.log('\n');

    // Test 2: List Normalization
    const badLists = `
- Item 1
  - Nested
- Item 2
    - Too deep
`;
    console.log('--- Test 2: List Normalization ---');
    console.log('Input:', badLists.trim());
    const formattedLists = await formatMarkdown(badLists);
    console.log('Output:', formattedLists.trim());
    console.log('\n');

    // Test 3: Code Language Detection
    const noLangCode = `
\`\`\`
const hello = "world";
console.log(hello);
\`\`\`
`;
    console.log('--- Test 3: Code Language Detection ---');
    console.log('Input:', noLangCode.trim());
    const formattedCode = await formatMarkdown(noLangCode);
    console.log('Output:', formattedCode.trim());
    console.log('\n');

    // Test 4: Python Detection
    const pythonCode = `
\`\`\`
def hello():
    print("world")
\`\`\`
`;
    console.log('--- Test 4: Python Detection ---');
    console.log('Input:', pythonCode.trim());
    const formattedPython = await formatMarkdown(pythonCode);
    console.log('Output:', formattedPython.trim());
}

testFormatting();
