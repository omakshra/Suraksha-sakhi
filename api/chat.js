export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { message } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: "You are a helpful assistant giving financial, legal and business advice to Indian users." },
          { role: "user", content: message }
        ],
      }),
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "🤖 I don't have a response.";
    res.status(200).json({ reply });
  } catch (err) {
    console.error('OpenRouter Error:', err.message);
    res.status(500).json({ reply: '⚠️ OpenRouter API error.' });
  }
}
