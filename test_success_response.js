// Test script to verify success response format
process.env.ACTION = 'search';
process.env.QUERY = 'test';

require('./src/index');
