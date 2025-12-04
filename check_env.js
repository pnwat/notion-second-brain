const { databaseId } = require('./src/notion');

console.log('Current NOTION_DB_ID:', databaseId);
console.log('Current NOTION_API_KEY (first 10 chars):', process.env.NOTION_API_KEY?.substring(0, 10) + '...');
