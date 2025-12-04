const { updateNote } = require('./updateNote');
const logger = require('../utils/logger');

/**
 * Updates multiple notes in a batch.
 * @param {object} params - Parameters for the action.
 * @param {Array} params.updates - List of update objects.
 * @returns {Promise<Array>} - List of results for each update.
 */
async function batchUpdate({ updates }) {
    if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error('No updates provided for batch operation.');
    }

    logger.info(`Starting batch update for ${updates.length} notes.`);

    const results = [];
    for (const update of updates) {
        try {
            logger.info(`Processing update for pageId: ${update.pageId || 'unknown'} / title: ${update.title || 'unknown'}`);
            const url = await updateNote(update);

            // Verify the update
            const { notion } = require('../notion');
            let verified = true;
            let verificationMsg = '';

            if (update.pageId) {
                try {
                    const updatedPage = await notion.pages.retrieve({ page_id: update.pageId });

                    if (update.category) {
                        const currentCategory = updatedPage.properties['カテゴリ']?.select?.name;
                        if (currentCategory !== update.category) {
                            verified = false;
                            verificationMsg = `Expected category "${update.category}", but got "${currentCategory}".`;
                        }
                    }
                } catch (verifyError) {
                    logger.warn(`Verification failed due to error: ${verifyError.message}`);
                }
            }

            if (!verified) {
                logger.warn(`Update verification failed for ${update.pageId}. ${verificationMsg}`);
                results.push({
                    id: update.pageId,
                    title: update.title,
                    status: 'warning',
                    message: `Update appeared successful but value did not change. ${verificationMsg}`,
                    url: url
                });
            } else {
                results.push({
                    id: update.pageId,
                    title: update.title,
                    status: 'success',
                    url: url,
                });
            }
        } catch (error) {
            logger.error(`Failed to update note: ${update.pageId || update.title}`, { error: error.message });
            results.push({
                id: update.pageId,
                title: update.title,
                status: 'error',
                error: error.message,
            });
        }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    logger.info(`Batch update completed. Success: ${successCount}, Warning: ${warningCount}, Failed: ${results.length - successCount - warningCount}`);

    return results;
}

module.exports = { batchUpdate };
