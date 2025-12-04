// Test using template to create a note
process.env.ACTION = 'add';
process.env.PAYLOAD = JSON.stringify({
    title: '日報 2025-12-04',
    content: '## 今日の成果\n- テンプレート機能の実装完了',
    template: 'daily_report',
    category: 'Tech'
});
process.env.NOTION_API_KEY = process.env.NOTION_API_KEY || 'dummy';
process.env.NOTION_DB_ID = process.env.NOTION_DB_ID || 'dummy';

// Run the main script
require('./src/index.js');
