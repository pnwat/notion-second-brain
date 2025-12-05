/**
 * Configuration
 * Set these in Project Settings > Script Properties
 */
const PROPERTIES = PropertiesService.getScriptProperties();
const GEMINI_API_KEY = PROPERTIES.getProperty('GEMINI_API_KEY');
const GITHUB_TOKEN = PROPERTIES.getProperty('GITHUB_TOKEN');
const GITHUB_OWNER = PROPERTIES.getProperty('GITHUB_OWNER');
const GITHUB_REPO = PROPERTIES.getProperty('GITHUB_REPO');
const GEMINI_MODEL = 'gemini-1.5-flash'; // or 'gemini-1.5-pro'

/**
 * Serve the web app
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Notion Second Brain AI')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Handle chat requests from the client
 */
function chat(userMessage, history) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    // Construct the conversation history
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // Add the new user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Define tools (Function Declarations)
    const tools = [{
      function_declarations: [
        {
          name: "add_note",
          description: "Create a new note in Notion. For books, use 'Book' category and leave content empty.",
          parameters: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING", description: "Title of the note" },
              content: { type: "STRING", description: "Content of the note. Empty for Book category." },
              category: { 
                type: "STRING", 
                description: "Category: Tech, Travel, Finance, Life, Business, Others, Book",
                enum: ["Tech", "Travel", "Finance", "Life", "Business", "Others", "Book"]
              },
              tags: { type: "STRING", description: "Comma-separated tags" },
              template: { type: "STRING", description: "Template name (optional)" }
            },
            required: ["title", "category"]
          }
        },
        {
          name: "update_note",
          description: "Update an existing note or append content to a section.",
          parameters: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING", description: "Title of the note to update" },
              content: { type: "STRING", description: "Content to append or replace" },
              mode: { type: "STRING", description: "append or replace", enum: ["append", "replace"] },
              section: { type: "STRING", description: "Target section name (e.g., 'クリップ', '感想')" }
            },
            required: ["title", "content"]
          }
        },
        {
          name: "search_notes",
          description: "Search for notes in Notion.",
          parameters: {
            type: "OBJECT",
            properties: {
              query: { type: "STRING", description: "Search query" }
            },
            required: ["query"]
          }
        }
      ]
    }];

    // First API call to Gemini
    const payload = {
      contents: contents,
      tools: tools,
      system_instruction: {
        parts: [{ text: `You are a helpful assistant managing a Notion Second Brain.
        
        IMPORTANT RULES:
        1. For 'Book' category notes, ALWAYS set 'content' to empty string (""). The system will auto-apply a template.
        2. When updating a note, use 'section' parameter to target specific sections like 'クリップ' (Clips) or '感想' (Thoughts).
        3. Always reply in Japanese unless asked otherwise.
        `}]
      }
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    let response = UrlFetchApp.fetch(url, options);
    let data = JSON.parse(response.getContentText());

    if (data.error) {
      throw new Error(data.error.message);
    }

    // Check for function calls
    const candidate = data.candidates[0];
    const part = candidate.content.parts[0];

    if (part.functionCall) {
      const functionName = part.functionCall.name;
      const args = part.functionCall.args;
      
      // Execute the function (call GitHub Actions)
      const result = executeGitHubAction(functionName, args);
      
      // Send the result back to Gemini
      const functionResponse = {
        functionResponse: {
          name: functionName,
          response: { result: result }
        }
      };
      
      // Add the model's function call and the function response to history
      contents.push({
        role: 'model',
        parts: [part] // The function call request
      });
      contents.push({
        role: 'function',
        parts: [functionResponse]
      });
      
      // Second API call to get the final natural language response
      const secondPayload = {
        contents: contents,
        tools: tools
      };
      
      const secondOptions = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(secondPayload),
        muteHttpExceptions: true
      };
      
      const secondResponse = UrlFetchApp.fetch(url, secondOptions);
      const secondData = JSON.parse(secondResponse.getContentText());
      
      return secondData.candidates[0].content.parts[0].text;
    } else {
      // No function call, just return the text
      return part.text;
    }

  } catch (e) {
    return `Error: ${e.message}`;
  }
}

/**
 * Execute GitHub Action via API
 */
function executeGitHubAction(functionName, args) {
  const actionMap = {
    'add_note': 'add',
    'update_note': 'update',
    'search_notes': 'search'
  };
  
  const action = actionMap[functionName];
  if (!action) return "Unknown function";

  const inputs = {
    action: action,
    ...args
  };
  
  // Convert all inputs to strings as GitHub Actions inputs are strings
  for (const key in inputs) {
    if (typeof inputs[key] !== 'string') {
      inputs[key] = String(inputs[key]);
    }
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/sync.yml/dispatches`;
  
  const options = {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GAS-Gemini-Client'
    },
    contentType: 'application/json',
    payload: JSON.stringify({
      ref: 'master',
      inputs: inputs
    }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  
  if (response.getResponseCode() === 204) {
    return `Successfully triggered action '${action}' with params: ${JSON.stringify(args)}. Please wait a moment for Notion to update.`;
  } else {
    return `Failed to trigger GitHub Action. Status: ${response.getResponseCode()} Body: ${response.getContentText()}`;
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
