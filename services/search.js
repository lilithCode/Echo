const axios = require("axios");

const EXA_BASE = "https://ai.hackclub.com/proxy/v1/exa";
const headers = {
  Authorization: `Bearer ${process.env.HACKCLUB_AI_KEY}`,
  "Content-Type": "application/json",
};

async function searchWeb(query) {
  try {
    const searchRes = await axios.post(
      `${EXA_BASE}/search`,
      {
        query,
        numResults: 5,
        useAutoprompt: true,
      },
      { headers, timeout: 15000 },
    );

    const results = searchRes.data.results;
    if (!results || results.length === 0) throw new Error("No results.");

    const urls = results.slice(0, 3).map((r) => r.url);
    const contentsRes = await axios.post(
      `${EXA_BASE}/contents`,
      {
        urls,
        text: { maxCharacters: 800 },
      },
      { headers, timeout: 15000 },
    );

    return contentsRes.data.results
      .map((page) => {
        const meta = results.find((r) => r.url === page.url) || {};
        return `[${meta.title || page.url}](${page.url})\n${page.text || "No content."}`;
      })
      .join("\n\n---\n\n");
  } catch (err) {
    throw err;
  }
}

async function searchDocs(query) {
  try {
    const searchRes = await axios.post(
      `${EXA_BASE}/search`,
      {
        query: `official documentation for ${query}`,
        numResults: 3,
        useAutoprompt: true,

      },
      { headers, timeout: 15000 },
    );

    const results = searchRes.data.results;
    if (!results || results.length === 0) {
      return {
        answer: "I couldn't find any official docs for that. Hmm...",
        sources: [],
      };
    }

    //  Get the content of those pages
    const contentsRes = await axios.post(
      `${EXA_BASE}/contents`,
      {
        urls: results.map((r) => r.url),
        text: { maxCharacters: 1500 },
      },
      { headers, timeout: 15000 },
    );

    const fullContext = contentsRes.data.results
      .map((page) => `SOURCE: ${page.url}\nCONTENT: ${page.text}`)
      .join("\n\n---\n\n");

    const { getAIResponse } = require("./ai");
    const prompt = `
      You are a technical documentation expert. Based on the following documentation snippets, provide a concise and helpful explanation for: "${query}".
      
      CONTEXT:
      ${fullContext}
      
      INSTRUCTIONS:
      - Use clear, technical language.
      - Use markdown code blocks for examples if present in the text.
      - If the documentation provides a clear "how-to", list the steps.
      - Keep it short but thorough.
    `;

    const answer = await getAIResponse(prompt);

    return {
      answer,
      sources: results.map((r) => ({ title: r.title, url: r.url })),
    };
  } catch (err) {
    console.error("[Search Service] searchDocs error:", err.message);
    throw err;
  }
}

module.exports = { searchWeb, searchDocs };
