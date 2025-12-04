const { convertMarkdownToBlocks } = require('./src/utils/markdownConverter');
const { applyTemplate, saveTemplate, listTemplates } = require('./src/utils/templateManager');
const manageTemplate = require('./src/modules/manageTemplate');
const logger = require('./src/utils/logger');

async function testAdvancedFeatures() {
    console.log('=== Testing Advanced Features ===\n');

    // --- Test 1: Math Conversion ---
    console.log('--- Test 1: Math Conversion ---');
    const mathMarkdown = `
# Math Test
Here is an inline equation: $E=mc^2$

And a block equation:
$$
\\frac{1}{2}
$$
`;
    const mathBlocks = convertMarkdownToBlocks(mathMarkdown);
    console.log('Math Blocks:', JSON.stringify(mathBlocks, null, 2));

    // Verify
    const hasEquationBlock = mathBlocks.some(b => b.type === 'equation');
    const hasInlineEquation = mathBlocks.some(b =>
        b.type === 'paragraph' && b.paragraph.rich_text.some(t => t.type === 'equation')
    );

    if (hasEquationBlock && hasInlineEquation) {
        console.log('[PASS] Math conversion successful');
    } else {
        console.error('[FAIL] Math conversion failed');
    }
    console.log('\n');

    // --- Test 2: Mermaid Conversion ---
    console.log('--- Test 2: Mermaid Conversion ---');
    const mermaidMarkdown = `
\`\`\`mermaid
graph TD;
    A-->B;
\`\`\`
`;
    const mermaidBlocks = convertMarkdownToBlocks(mermaidMarkdown);
    console.log('Mermaid Blocks:', JSON.stringify(mermaidBlocks, null, 2));

    const isMermaid = mermaidBlocks.some(b => b.type === 'code' && b.code.language === 'mermaid');
    if (isMermaid) {
        console.log('[PASS] Mermaid conversion successful');
    } else {
        console.error('[FAIL] Mermaid conversion failed');
    }
    console.log('\n');

    // --- Test 3: Template Management ---
    console.log('--- Test 3: Template Management ---');

    // Save template
    await manageTemplate({ subAction: 'save', name: 'test_template', content: '# Daily Report {{date}}\n## {{title}}' });

    // List templates
    const listResult = await manageTemplate({ subAction: 'list' });
    console.log('Templates:', listResult.templates);
    if (listResult.templates.includes('test_template')) {
        console.log('[PASS] Template saved and listed');
    } else {
        console.error('[FAIL] Template not listed');
    }

    // Apply template
    const applied = await applyTemplate('test_template', { title: 'My Title' });
    console.log('Applied Template:\n', applied);

    if (applied.includes('Daily Report') && applied.includes('My Title') && !applied.includes('{{date}}')) {
        console.log('[PASS] Template application successful');
    } else {
        console.error('[FAIL] Template application failed');
    }
}

testAdvancedFeatures().catch(console.error);
