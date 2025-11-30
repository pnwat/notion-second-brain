const { addNote } = require('./add');
const { updateNote } = require('./update');
const { searchNotes } = require('./search');

async function main() {
    const payloadStr = process.env.PAYLOAD;
    if (!payloadStr) {
        console.error('Error: No PAYLOAD environment variable provided.');
        process.exit(1);
    }

    let payload;
    try {
        payload = JSON.parse(payloadStr);
    } catch (error) {
        console.error('Error: Invalid JSON in PAYLOAD.');
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
