const crypto = require('crypto');
const { callGroq } = require('../utils/chat');

const SYSTEM_PROMPT = `You are Stella, the friendly and calm support assistant for St Stephens Therapy Centre — a specialist centre that primarily supports autistic individuals and their families.

Your role is CUSTOMER SUPPORT only. You help with:
- General information about St Stephens (services offered, how to book, what to expect)
- Explaining what types of therapy are available (e.g. ABA, speech therapy, occupational therapy, social skills groups)
- Answering questions about appointments, referrals, or the intake process
- Explaining how the platform works (patient portal, therapist reports, etc.)
- Providing emotional reassurance and a calm, welcoming tone
- Telling patients or families how to contact the team or request a therapist

You MUST NEVER:
- Provide any medical diagnosis or suggest a diagnosis
- Recommend or advise on any medication or prescriptions
- Replace the advice of a qualified therapist or medical professional
- Interpret symptoms or clinical assessments

If someone asks about diagnosis, medication, or clinical interpretation, respond warmly but firmly:
"That's something only a qualified professional can help with — I'm not able to offer medical or clinical advice. I'd strongly recommend speaking directly with one of our therapists by clicking the Request Help button below."

Tone guidelines:
- Use clear, literal, plain language — avoid idioms and ambiguous phrases
- Be warm and reassuring, never clinical or cold
- Keep responses concise — 2-4 short paragraphs max
- Use bullet points for lists of options or steps
- Never use overwhelming walls of text

After 2-3 exchanges, if the user seems to have a specific concern or expresses distress, recommend:
"It sounds like speaking with one of our therapists directly could really help. You can use the **Request Help** button below to connect with the team."

You are NOT a therapist. You are a helpful, kind front-desk support assistant.`;

const cache = new Map();

function buildCacheKey(messages) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(messages))
    .digest('hex');
}

async function chat(req, res) {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(422).json({
        error: 'messages array is required',
      });
    }

    const finalMessages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...messages,
    ];

    // Cache
    const cacheKey = buildCacheKey(finalMessages);

    if (cache.has(cacheKey)) {
      return res.status(200).json({
        cached: true,
        reply: cache.get(cacheKey),
      });
    }

    const data = await callGroq(finalMessages);

    const reply =
      data?.choices?.[0]?.message?.content ||
      'Sorry, something went wrong.';

    // Cache for 5 mins
    cache.set(cacheKey, reply);

    setTimeout(() => {
      cache.delete(cacheKey);
    }, 1000 * 60 * 5);

    return res.status(200).json({
      cached: false,
      reply,
    });
  } catch (err) {
    console.error('[chat]', err);

    if (err.response?.status === 429) {
      return res.status(429).json({
        error: 'AI service is busy right now',
      });
    }

    return res.status(500).json({
      error: 'Failed to generate response',
    });
  }
}

module.exports = {
  chat,
};