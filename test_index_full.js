// Simulate GitHub Actions environment
process.env.ACTION = 'add';
process.env.TITLE = 'Test Book';
process.env.CATEGORY = 'Book';
process.env.CONTENT = 'Test Content';
process.env.NOTION_API_KEY = 'mock_key';
process.env.NOTION_DB_ID = 'mock_db_id';

// Capture stdout/stderr to check for JSON output
const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
    originalLog('[STDOUT]', ...args);
};
console.error = (...args) => {
    originalError('[STDERR]', ...args);
};

// Run index.js
require('./src/index.js');
