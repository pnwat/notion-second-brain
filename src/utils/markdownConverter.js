const { markdownToBlocks } = require('@tryfabric/martian');
const logger = require('./logger');

/**
 * Convert Markdown text to Notion blocks
 * @param {string} markdown - Markdown text
 * @returns {Array} Array of Notion blocks
 */
function convertMarkdownToBlocks(markdown) {
    if (!markdown || typeof markdown !== 'string') {
        logger.warn('Invalid markdown input, returning empty array');
        return [];
    }

    try {
        const blocks = markdownToBlocks(markdown);
        logger.info(`Converted Markdown to ${blocks.length} Notion blocks`);
        return blocks;
    } catch (error) {
        logger.error('Markdown to blocks conversion failed', { error: error.message });
        // Fallback: treat as plain text
        logger.warn('Falling back to plain text paragraph');
        return [{
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [{
                    type: 'text',
                    text: { content: markdown }
                }]
            }
        }];
    }
}

/**
 * Convert Notion blocks to Markdown text
 * Custom implementation since @tryfabric/martian doesn't provide blocksToMarkdown
 * @param {Array} blocks - Array of Notion blocks
 * @returns {string} Markdown text
 */
function convertBlocksToMarkdown(blocks) {
    if (!blocks || !Array.isArray(blocks)) {
        logger.warn('Invalid blocks input, returning empty string');
        return '';
    }

    try {
        let markdown = '';

        for (const block of blocks) {
            const type = block.type;
            const content = block[type];

            if (!content || !content.rich_text) continue;

            const text = content.rich_text.map(rt => rt.plain_text || rt.text?.content || '').join('');

            switch (type) {
                case 'heading_1':
                    markdown += `# ${text}\n\n`;
                    break;
                case 'heading_2':
                    markdown += `## ${text}\n\n`;
                    break;
                case 'heading_3':
                    markdown += `### ${text}\n\n`;
                    break;
                case 'paragraph':
                    markdown += `${text}\n\n`;
                    break;
                case 'bulleted_list_item':
                    markdown += `- ${text}\n`;
                    break;
                case 'numbered_list_item':
                    markdown += `1. ${text}\n`;
                    break;
                case 'code':
                    const language = content.language || '';
                    markdown += `\`\`\`${language}\n${text}\n\`\`\`\n\n`;
                    break;
                case 'quote':
                    markdown += `> ${text}\n\n`;
                    break;
                case 'divider':
                    markdown += `---\n\n`;
                    break;
                default:
                    // Unsupported block type, treat as paragraph
                    if (text) {
                        markdown += `${text}\n\n`;
                    }
                    break;
            }
        }

        logger.info(`Converted ${blocks.length} Notion blocks to Markdown`);
        return markdown.trim();
    } catch (error) {
        logger.error('Blocks to Markdown conversion failed', { error: error.message });
        return '';
    }
}

module.exports = {
    convertMarkdownToBlocks,
    convertBlocksToMarkdown
};
