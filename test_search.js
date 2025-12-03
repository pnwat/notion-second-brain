// Test enhanced search - clear all env vars first
delete process.env.UPDATES;
delete process.env.LIMIT;
delete process.env.PAGE_ID;
delete process.env.TITLE;
delete process.env.CONTENT;
delete process.env.CATEGORY;
delete process.env.TAGS;
delete process.env.REPLACE_CONTENT;

process.env.ACTION = 'search';
process.env.QUERY = 'Notion';
process.env.LIMIT = '3';

require('./src/index');
