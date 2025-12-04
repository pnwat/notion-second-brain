const { convertMarkdownToBlocks, convertBlocksToMarkdown } = require('./src/utils/markdownConverter');

const testMarkdown = `# Test Heading

This is a **bold** text and this is *italic*.

## Subheading

- Item 1
- Item 2
- Item 3

1. Numbered item 1
2. Numbered item 2

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

> This is a quote

---

[Link text](https://example.com)
`;

console.log('=== Testing Markdown to Blocks ===');
const blocks = convertMarkdownToBlocks(testMarkdown);
console.log(JSON.stringify(blocks, null, 2));

console.log('\n=== Testing Blocks to Markdown ===');
const markdown = convertBlocksToMarkdown(blocks);
console.log(markdown);

console.log('\n=== Round-trip test ===');
console.log('Original length:', testMarkdown.length);
console.log('Converted length:', markdown.length);
console.log('Match:', testMarkdown.trim() === markdown.trim() ? 'YES' : 'NO (expected, some formatting may differ)');
