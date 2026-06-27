const app = require("../app");
const { getAIResponse, ECHO_PERSONALITY } = require("../services/ai");
const { searchWeb } = require("../services/search");
const { getSlackDisplayName } = require("../services/utils");

app.command("/echo-search", async ({ command, ack, respond }) => {
  await ack();

  const query = command.text.trim();
  if (!query) return await respond("Hmm... give me a topic to search.");

  const userInfo = await app.client.users.info({ user: command.user_id });
  const userName = getSlackDisplayName(userInfo.user);

  try {
    await respond({
      response_type: "in_channel",
      text: `*${userName}:* ${query}\n\n⏳ *Searching the web...*`,
    });

    const liveContext = await searchWeb(query);

    const prompt = `
USER QUERY: ${query}
SEARCH RESULTS:
${liveContext}
INSTRUCTIONS: Summarize findings. Use markdown links. Keep it cool.
    `.trim();

    const answer = await getAIResponse(
      prompt,
      ECHO_PERSONALITY,
      "openai/gpt-4o",
    );

    await respond({
      response_type: "in_channel",
      replace_original: true,
      text: `*${userName}:* ${query}\n\n*Echo:* ${answer}`,
    });
  } catch (error) {
    console.error("[Echo] /echo-search failed:", error.message);
    await respond({
      text: "Eh... my web search is acting up. Maybe try again later?",
      replace_original: false,
    });
  }
});
