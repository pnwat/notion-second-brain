const fs = require('fs').promises;
const path = require('path');
const { format } = require('date-fns');
const logger = require('./logger');

const TEMPLATE_DIR = path.join(process.cwd(), 'templates');

/**
 * Ensure template directory exists
 */
async function ensureTemplateDir() {
    try {
        await fs.mkdir(TEMPLATE_DIR, { recursive: true });
    } catch (error) {
        logger.error('Failed to create template directory', { error: error.message });
    }
}

/**
 * List available templates
 * @returns {Promise<string[]>} List of template names (without extension)
 */
async function listTemplates() {
    await ensureTemplateDir();
    try {
        const files = await fs.readdir(TEMPLATE_DIR);
        return files
            .filter(file => file.endsWith('.md'))
            .map(file => file.replace('.md', ''));
    } catch (error) {
        logger.error('Failed to list templates', { error: error.message });
        return [];
    }
}

/**
 * Get template content
 * @param {string} name - Template name
 * @returns {Promise<string|null>} Template content or null if not found
 */
async function getTemplate(name) {
    await ensureTemplateDir();
    const filePath = path.join(TEMPLATE_DIR, `${name}.md`);
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        logger.warn(`Template not found: ${name}`);
        return null;
    }
}

/**
 * Save template content
 * @param {string} name - Template name
 * @param {string} content - Template content
 * @returns {Promise<boolean>} Success status
 */
async function saveTemplate(name, content) {
    await ensureTemplateDir();
    const filePath = path.join(TEMPLATE_DIR, `${name}.md`);
    try {
        await fs.writeFile(filePath, content, 'utf8');
        logger.info(`Template saved: ${name}`);
        return true;
    } catch (error) {
        logger.error(`Failed to save template: ${name}`, { error: error.message });
        return false;
    }
}

/**
 * Apply template with variable substitution
 * @param {string} templateName - Name of the template to apply
 * @param {object} context - Context variables (title, etc.)
 * @returns {Promise<string|null>} Processed content or null if template not found
 */
async function applyTemplate(templateName, context = {}) {
    const content = await getTemplate(templateName);
    if (!content) return null;

    const now = new Date();
    const variables = {
        date: format(now, 'yyyy-MM-dd'),
        datetime: format(now, 'yyyy-MM-dd HH:mm'),
        title: context.title || '',
        ...context
    };

    let processed = content;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processed = processed.replace(regex, value);
    }

    return processed;
}

module.exports = {
    listTemplates,
    getTemplate,
    saveTemplate,
    applyTemplate
};
