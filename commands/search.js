const app = require("../app");
const { getAIResponse, ECHO_PERSONALITY } = require("../services/ai");
const { searchWeb } = require("../services/search");
const { getSlackDisplayName } = require("../services/utils");

app.command("/echo-search", async ({ command, ack, respond }) => {
  await ack();

  const query = command.text.trim();
  if (!query)
    return await respond("You need to give me a topic to search.");

  const userInfo = await app.client.users.info({ user: command.user_id });
  const userName = getSlackDisplayName(userInfo.user);

  try {
    const loadingMsg = await app.client.chat.postMessage({
      channel: command.channel_id,
      text: `*${userName}:* ${query}\n\n *Searching the web...* `,
    });

    const liveContext = await searchWeb(query);

    const prompt = `
TODAY'S DATE: ${new Date().toDateString()}
USER QUERY: ${query}

REAL WEB SEARCH RESULTS (fetched live via Exa):
${liveContext}

INSTRUCTIONS: Use ONLY the search results above. Cite sources as markdown links [Title](URL). Be concise but informative. End with a cool closing.
    `.trim();

    const answer = await getAIResponse(
      prompt,
      ECHO_PERSONALITY,
      "openai/gpt-4o",
    );

    await app.client.chat.update({
      channel: command.channel_id,
      ts: loadingMsg.ts,
      text: `*${userName}:* ${query}\n\n*Echo:* ${answer.replace(/^\n+/, "")}`,
    });
  } catch (error) {
    console.error("[Echo] /echo-search failed:", error.message);
    await respond(
      "...Eh, my web search is down right now",
    );
  }
});
