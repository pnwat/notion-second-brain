// Test batch_update with proper JSON file
const fs = require('fs');

const updates = [
    {
        pageId: '2beb6f07-73e2-816a-9ea9-e0acaede5296',
        category: 'Tech'
    }
];

process.env.ACTION = 'batch_update';
process.env.UPDATES = JSON.stringify(updates);

require('./src/index');
