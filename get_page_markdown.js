const { notion } = require('./src/notion');

const pageId = '2beb6f07-73e2-81c3-a9de-ca3206a3b41a';

function extractText(richText) {
    if (!richText || !Array.isArray(richText)) return '';
    return richText.map(t => t.plain_text || '').join('');
}

async function getPageAsMarkdown() {
    try {
        const blocks = await notion.blocks.children.list({
            block_id: pageId,
            page_size: 100
        });

        let markdown = '';

        for (const block of blocks.results) {
            const type = block.type;

            switch (type) {
                case 'paragraph':
                    markdown += extractText(block.paragraph.rich_text) + '\n\n';
                    break;
                case 'heading_1':
                    markdown += '# ' + extractText(block.heading_1.rich_text) + '\n\n';
                    break;
                case 'heading_2':
                    markdown += '## ' + extractText(block.heading_2.rich_text) + '\n\n';
                    break;
                case 'heading_3':
                    markdown += '### ' + extractText(block.heading_3.rich_text) + '\n\n';
                    break;
                case 'bulleted_list_item':
                    markdown += '- ' + extractText(block.bulleted_list_item.rich_text) + '\n';
                    break;
                case 'numbered_list_item':
                    markdown += '1. ' + extractText(block.numbered_list_item.rich_text) + '\n';
                    break;
                case 'code':
                    const code = extractText(block.code.rich_text);
                    const lang = block.code.language || '';
                    markdown += '```' + lang + '\n' + code + '\n```\n\n';
                    break;
                case 'quote':
                    markdown += '> ' + extractText(block.quote.rich_text) + '\n\n';
                    break;
                case 'divider':
                    markdown += '---\n\n';
                    break;
                default:
                    // Skip unsupported block types
                    break;
            }
        }

        console.log(markdown);
    } catch (error) {
        console.error('Error:', error);
    }
}

getPageAsMarkdown();
