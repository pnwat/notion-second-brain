// Test template management locally
process.env.ACTION = 'manage_template';
process.env.PAYLOAD = JSON.stringify({
    subAction: 'save',
    name: 'daily_report',
    content: '# 日報 {{date}}\n## 今日の成果\n- \n## 明日の予定\n- '
});
process.env.NOTION_API_KEY = 'dummy';
process.env.NOTION_DB_ID = 'dummy';

// Run the main script
require('./src/index.js');
