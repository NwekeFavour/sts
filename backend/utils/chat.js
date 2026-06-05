// utils/chat.js
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";
const MODEL        = "llama-3.1-8b-instant";

async function callGroq(messages, maxRetries = 2) {
  let delay = 1500;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 15_000);

    try {
      const res = await fetch(GROQ_URL, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model:       MODEL,
          messages,
          temperature: 0.6,
          max_tokens:  600,   // raised from 400 — enough for full answers without cutting off
          stream:      false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.status === 429) {
        if (attempt === maxRetries) {
          const err = new Error("Groq rate limit exceeded");
          err.status = 429;
          throw err;
        }
        await sleep(delay);
        delay *= 2;
        continue;
      }

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Groq API error ${res.status}: ${body}`);
      }

      return await res.json();
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === "AbortError") throw new Error("Groq request timed out after 15s");
      throw err;
    }
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = { callGroq };