const { handleRequest } = require('./notionClient');

try {
    const result = await handleRequest(action, params);

    // Output success response as JSON
    const response = {
        status: 'success',
        action: action,
        result: result
    };
    console.log(JSON.stringify(response, null, 2));
    process.exit(0);

    main();
