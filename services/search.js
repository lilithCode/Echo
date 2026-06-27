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
    if (!results || results.length === 0) {
      throw new Error("Exa returned no results for that query.");
    }

    const urls = results.slice(0, 3).map((r) => r.url);

    const contentsRes = await axios.post(
      `${EXA_BASE}/contents`,
      {
        urls,
        text: {
          maxCharacters: 800,
        },
      },
      { headers, timeout: 15000 },
    );

    const pages = contentsRes.data.results;

    const formatted = pages
      .map((page) => {
        const meta = results.find((r) => r.url === page.url) || {};
        const title = meta.title || page.url;
        const body =
          page.text?.trim() || meta.snippet || "No content extracted.";
        return `[${title}](${page.url})\n${body}`;
      })
      .join("\n\n---\n\n");

    return formatted;
  } catch (err) {
    console.error("[Echo] searchWeb (Exa) error:", err.message);
    throw new Error(
      "Real web search failed.",
    );
  }
}

async function searchDocs(query) {
  try {
    const res = await axios.post(
      `${EXA_BASE}/answer`,
      {
        query,
      },
      { headers, timeout: 20000 },
    );

    const answer = res.data.answer;
    const sources = (res.data.citations || []).map((c) => ({
      title: c.title || c.url,
      url: c.url,
    }));

    return { answer, sources };
  } catch (err) {
    console.error("[Echo] searchDocs (Exa/answer) error:", err.message);
    throw new Error(
      "Documentation search failed.",
    );
  }
}

module.exports = { searchWeb, searchDocs };
