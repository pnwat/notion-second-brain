const { searchNotes } = require('./src/modules/searchNotes');

searchNotes({ query: 'Notion Second Brain 機能提案・実装計画（Markdown対応編）' })
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(e => console.error(e));
