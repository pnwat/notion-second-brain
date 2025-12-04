const unified = require('unified');
const remarkParse = require('remark-parse');
const remarkStringify = require('remark-stringify');
const visit = require('unist-util-visit');
const logger = require('./logger');

/**
 * Format Markdown content for better structure
 * @param {string} markdown - Raw Markdown text
 * @param {object} options - Formatting options
 * @returns {Promise<string>} Formatted Markdown
 */
async function formatMarkdown(markdown, options = {}) {
    if (!markdown || typeof markdown !== 'string') {
        logger.warn('Invalid markdown input for formatting');
        return markdown;
    }

    const {
        normalizeHeadings = true,
        normalizeLists = true,
        addLanguageToCodeBlocks = true
    } = options;

    try {
        const processor = unified()
            .use(remarkParse)
            .use(() => (tree) => {
                if (normalizeHeadings) {
                    normalizeHeadingLevels(tree);
                }
                if (normalizeLists) {
                    normalizeListStructure(tree);
                }
                if (addLanguageToCodeBlocks) {
                    detectCodeLanguage(tree);
                }
            })
            .use(remarkStringify, {
                bullet: '-',
                emphasis: '*',
                strong: '**',
                fences: true,
                incrementListMarker: true
            });

        const result = await processor.process(markdown);
        logger.info('Successfully formatted Markdown');
        return String(result);
    } catch (error) {
        logger.error('Markdown formatting failed', { error: error.message });
        // Fallback: return original markdown
        return markdown;
    }
}

/**
 * Normalize heading levels
 * Ensures H1 is unique and hierarchy is correct
 */
function normalizeHeadingLevels(tree) {
    const headings = [];

    visit(tree, 'heading', (node) => {
        headings.push(node);
    });

    if (headings.length === 0) return;

    // Check if there's an H1
    let hasH1 = headings.some(h => h.depth === 1);

    // If no H1, promote first H2 to H1
    if (!hasH1) {
        const firstH2 = headings.find(h => h.depth === 2);
        if (firstH2) {
            firstH2.depth = 1;
            hasH1 = true;
        } else {
            // If no H2 either, promote the first heading
            headings[0].depth = 1;
            hasH1 = true;
        }
    }

    // Ensure no heading level jumps (e.g., H1 -> H3)
    let previousDepth = 0;
    for (const heading of headings) {
        if (heading.depth > previousDepth + 1) {
            heading.depth = previousDepth + 1;
        }
        previousDepth = heading.depth;
    }

    logger.info(`Normalized ${headings.length} headings`);
}

/**
 * Normalize list structure
 */
function normalizeListStructure(tree) {
    let listCount = 0;

    visit(tree, 'list', (node) => {
        // Ensure ordered lists start at 1
        if (node.ordered) {
            node.start = 1;
        }
        listCount++;
    });

    if (listCount > 0) {
        logger.info(`Normalized ${listCount} lists`);
    }
}

/**
 * Detect and add language to code blocks
 */
function detectCodeLanguage(tree) {
    let codeBlockCount = 0;
    let detectedCount = 0;

    visit(tree, 'code', (node) => {
        codeBlockCount++;
        if (!node.lang) {
            const detected = detectLanguage(node.value);
            if (detected !== 'text') {
                node.lang = detected;
                detectedCount++;
            }
        }
    });

    if (detectedCount > 0) {
        logger.info(`Detected language for ${detectedCount}/${codeBlockCount} code blocks`);
    }
}

/**
 * Simple language detection based on code patterns
 */
function detectLanguage(code) {
    if (!code) return 'text';

    const trimmed = code.trim();

    // JavaScript/TypeScript
    if (/^(import|export|const|let|var|function|class|async|await)\s/.test(trimmed)) {
        return 'javascript';
    }
    if (/^(interface|type|enum)\s/.test(trimmed)) {
        return 'typescript';
    }

    // Python
    if (/^(def|import|from|class|if __name__|print|async def)\s/.test(trimmed)) {
        return 'python';
    }

    // Java
    if (/^(public|private|protected|class|interface|package)\s/.test(trimmed)) {
        return 'java';
    }

    // SQL
    if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s/i.test(trimmed)) {
        return 'sql';
    }

    // HTML
    if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) {
        return 'html';
    }

    // CSS
    if (/^[.#]?[\w-]+\s*\{/.test(trimmed)) {
        return 'css';
    }

    // JSON
    if (/^[\{\[]/.test(trimmed) && /[\}\]]$/.test(trimmed)) {
        try {
            JSON.parse(trimmed);
            return 'json';
        } catch (e) {
            // Not valid JSON
        }
    }

    // Bash/Shell
    if (/^(#!\/bin\/bash|#!\/bin\/sh|npm|yarn|git|cd|ls|mkdir)\s/.test(trimmed)) {
        return 'bash';
    }

    return 'text';
}

module.exports = {
    formatMarkdown
};
