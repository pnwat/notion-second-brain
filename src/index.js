const { addNote } = require('./add');
const { updateNote } = require('./update');
const { searchNotes } = require('./search');

async function main() {
    let payload;

    // 1. Try to construct payload from individual environment variables
    if (process.env.ACTION) {
        payload = {
            action: process.env.ACTION,
            title: process.env.TITLE,
            content: process.env.CONTENT,
            category: process.env.CATEGORY,
            tags: process.env.TAGS ? process.env.TAGS.split(',') : undefined,
            pageId: process.env.PAGE_ID,
            query: process.env.QUERY,
        };
    }
    // 2. Fallback to PAYLOAD JSON string (for backward compatibility or local dev)
    else if (process.env.PAYLOAD) {
        try {
            payload = JSON.parse(process.env.PAYLOAD);
        } catch (error) {
            console.error('Error: Invalid JSON in PAYLOAD.');
            process.exit(1);
        }
    } else {
        console.error('Error: No ACTION or PAYLOAD environment variable provided.');
        process.exit(1);
    }

    const { action, ...params } = payload;

    try {
        switch (action) {
            case 'add':
                await addNote(params);
                break;
            case 'update':
                await updateNote(params);
                break;
            case 'search':
                await searchNotes(params);
                break;
            default:
                console.error(`Error: Unknown action "${action}".`);
                process.exit(1);
        }
    } catch (error) {
        console.error('Operation failed:', error);
        process.exit(1);
    }
}

main();
