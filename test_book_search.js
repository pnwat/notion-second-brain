const { enrichBookMetadata } = require('./src/modules/enrichBookMetadata');

async function test() {
    // Test with the title from the logs
    const title = "イシューからはじめよ 改訂版 読書メモ";
    console.log(`Testing with title: "${title}"`);
    await enrichBookMetadata('dummy-id', title);

    // Test with a cleaner title
    const cleanTitle = "イシューからはじめよ 改訂版";
    console.log(`\nTesting with clean title: "${cleanTitle}"`);
    await enrichBookMetadata('dummy-id', cleanTitle);
}

test();
