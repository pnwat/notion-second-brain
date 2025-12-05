const { convertMarkdownToBlocks } = require('./src/utils/markdownConverter');

const markdown = `
# Title

> ## クリップ
> - Item 1

> ## 感想
`;

const blocks = convertMarkdownToBlocks(markdown);
console.log(JSON.stringify(blocks, null, 2));
