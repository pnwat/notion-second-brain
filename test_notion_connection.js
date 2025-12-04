const { Client } = require('@notionhq/client');

// Read from environment
const apiKey = process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DB_ID;

if (!apiKey || !databaseId) {
    console.error('ERROR: NOTION_API_KEY or NOTION_DB_ID not set');
    process.exit(1);
}

const notion = new Client({ auth: apiKey });

async function testConnection() {
    try {
        console.log('Testing Notion API connection...');
        console.log(`Database ID: ${databaseId}`);

        // Try to retrieve the database
        const database = await notion.databases.retrieve({ database_id: databaseId });
        console.log('\n✅ Successfully connected to database!');
        console.log(`Database Title: ${database.title[0]?.plain_text || 'Untitled'}`);
        console.log(`Database URL: ${database.url}`);

        // Try to query the database
        console.log('\nQuerying recent pages...');
        const response = await notion.databases.query({
            database_id: databaseId,
            page_size: 5,
            sorts: [
                {
                    timestamp: 'created_time',
                    direction: 'descending'
                }
            ]
        });

        console.log(`\nFound ${response.results.length} recent pages:`);
        response.results.forEach((page, i) => {
            const title = page.properties['名前']?.title[0]?.plain_text || 'Untitled';
            console.log(`${i + 1}. ${title} - ${page.url}`);
        });

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.code === 'unauthorized') {
            console.error('\nThe API key is invalid or does not have access to this database.');
        } else if (error.code === 'object_not_found') {
            console.error('\nThe database ID does not exist or the integration does not have access to it.');
            console.error('Make sure you have shared the database with your Notion integration.');
        }
    }
}

testConnection();
