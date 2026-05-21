const axios = require('axios');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODEL = 'llama-3.1-8b-instant';

async function callGroq(messages) {
  const response = await axios.post(
    GROQ_URL,
    {
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return response.data;
}

module.exports = {
  callGroq,
};