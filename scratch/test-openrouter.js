const fs = require('fs');
const path = require('path');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      env[match[1]] = value.trim();
    }
  });
  return env;
}

async function run() {
  const env = loadEnv(path.join(__dirname, '..', '.env.local'));
  const apiKey = env.OPENROUTER_API_KEY || env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("No API key found in .env.local");
    return;
  }

  const models = [
    'nvidia/nemotron-3-super-120b-a12b:free',
    'openai/gpt-oss-20b:free',
    'openai/gpt-oss-120b:free',
    'z-ai/glm-4.5-air:free'
  ];

  for (const model of models) {
    console.log('Testing model:', model);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/jahidulislamseo/UnifiedTools-Pro',
          'X-Title': 'UnifiedTools Pro'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Say hello in one word.' }]
        })
      });
      console.log('HTTP Status:', res.status);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (res.ok) {
          console.log('✅ Success! Raw Choice Message:', JSON.stringify(json.choices?.[0]?.message || json.choices));
        } else {
          console.log('❌ Error:', json.error?.message || json.error);
        }
      } catch {
        console.log('Non-JSON Response:', text);
      }
    } catch (e) {
      console.log('Fetch error:', e.message);
    }
    console.log('-----------------------------------');
  }
}

run();
