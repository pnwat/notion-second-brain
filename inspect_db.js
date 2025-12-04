const { notion, databaseId } = require('./src/notion');
const logger = require('./src/utils/logger');

async function inspectDatabase() {
    try {
        const response = await notion.databases.retrieve({ database_id: databaseId });
        console.log('Database Title:', response.title[0]?.plain_text);
        console.log('Properties:');
        for (const [name, prop] of Object.entries(response.properties)) {
            console.log(`- Name: "${name}"`);
            console.log(`  Type: ${prop.type}`);
            if (prop.type === 'select') {
                console.log('  Options:', prop.select.options.map(o => o.name).join(', '));
            }
            if (prop.type === 'multi_select') {
                console.log('  Options:', prop.multi_select.options.map(o => o.name).join(', '));
            }
        }
    } catch (error) {
        console.error('Error retrieving database:', error.message);
    }
}

inspectDatabase();
