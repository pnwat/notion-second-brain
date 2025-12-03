// Test script to verify error response format
process.env.ACTION = 'invalid_action';
process.env.TITLE = 'Test';

require('./src/index');
