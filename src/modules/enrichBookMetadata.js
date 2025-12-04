const { notion } = require('../notion');
const logger = require('../utils/logger');

/**
 * Enriches a Notion page with book metadata from Google Books API.
 * @param {string} pageId - The ID of the Notion page to update.
 * @param {string} title - The title of the book to search for.
 */
async function enrichBookMetadata(pageId, title) {
    try {
        // Clean the title by removing common note-taking suffixes
        let cleanTitle = title
            .replace(/\s*(読書)?メモ\s*$/, '')
            .replace(/\s*の?読書ノート\s*$/, '')
            .replace(/\s*Book\s*Note\s*$/i, '')
            .replace(/\s*Reading\s*Note\s*$/i, '')
            .trim();

        logger.info(`Fetching metadata for book: ${cleanTitle}${cleanTitle !== title ? ` (original: ${title})` : ''}`);

        const query = encodeURIComponent(cleanTitle);
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);

        if (!response.ok) {
            throw new Error(`Google Books API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.items || !data.items.length) {
            logger.warn(`No book found for title: ${cleanTitle}`);
            return;
        }

        const info = data.items[0].volumeInfo;
        logger.info(`Found book: ${info.title} by ${info.authors ? info.authors.join(', ') : 'Unknown'}`);

        const properties = {};

        // Helper to create rich_text property
        const createRichText = (content) => ({
            rich_text: [{ text: { content: String(content || '') } }]
        });

        if (info.authors && info.authors.length > 0) {
            properties['著者'] = createRichText(info.authors[0]);
        }

        if (info.publisher) {
            properties['出版社'] = createRichText(info.publisher);
        }

        if (info.publishedDate) {
            properties['出版年'] = createRichText(info.publishedDate);
        }

        if (info.industryIdentifiers && info.industryIdentifiers.length > 0) {
            // Prefer ISBN_13, fallback to first available
            const isbn = info.industryIdentifiers.find(id => id.type === 'ISBN_13') || info.industryIdentifiers[0];
            properties['ISBN'] = createRichText(isbn.identifier);
        }

        if (info.pageCount) {
            properties['ページ数'] = { number: info.pageCount };
        }

        if (Object.keys(properties).length === 0) {
            logger.info('No relevant metadata found to update.');
            return;
        }

        await notion.pages.update({
            page_id: pageId,
            properties: properties
        });

        logger.info('Successfully updated book metadata.');

    } catch (error) {
        logger.error('Error enriching book metadata', { error: error.message });
        // Don't throw, just log error so we don't fail the main note creation
    }
}

module.exports = { enrichBookMetadata };
