const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct", // Or try gpt-3.5 if available
        messages: [
          { role: "system", content: "You are a helpful assistant giving financial, legal and business advice to Indian users." },
          { role: "user", content: message }
        ],
      }),
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "🤖 I don't have a response.";
    res.json({ reply });
  } catch (err) {
    console.error('OpenRouter Error:', err.message);
    res.status(500).json({ reply: '⚠️ OpenRouter API error.' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running via OpenRouter on http://localhost:${PORT}`);
});
