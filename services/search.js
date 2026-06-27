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

module.exports = { searchWeb };
