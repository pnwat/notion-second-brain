const logger = require('../utils/logger');
const { listTemplates, getTemplate, saveTemplate } = require('../utils/templateManager');

/**
 * Handle template management requests
 * @param {object} params - Request parameters
 * @returns {Promise<object>} Response data
 */
async function manageTemplate({ subAction, name, content }) {
    logger.info(`Managing template: ${subAction} ${name || ''}`);

    try {
        switch (subAction) {
            case 'list':
                const templates = await listTemplates();
                return { templates };

            case 'get':
                if (!name) throw new Error('Template name is required for get action');
                const templateContent = await getTemplate(name);
                if (templateContent === null) {
                    throw new Error(`Template not found: ${name}`);
                }
                return { name, content: templateContent };

            case 'save':
                if (!name) throw new Error('Template name is required for save action');
                if (!content) throw new Error('Template content is required for save action');
                const success = await saveTemplate(name, content);
                if (!success) throw new Error('Failed to save template');
                return { message: `Template saved: ${name}` };

            default:
                throw new Error(`Invalid subAction: ${subAction}`);
        }
    } catch (error) {
        logger.error('Error managing template', { error: error.message });
        throw error;
    }
}

module.exports = manageTemplate;
