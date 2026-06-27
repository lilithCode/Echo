const app = require("../app");
const { getAIResponse, ECHO_PERSONALITY } = require("../services/ai");
const { searchWeb } = require("../services/search");
const { getSlackDisplayName } = require("../services/utils");

app.command("/echo-search", async ({ command, ack }) => {
  await ack();

  const query = command.text.trim();
  if (!query) {
    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "Hmm... give me a topic to search.",
    });
    return;
  }

  const userInfo = await app.client.users.info({ user: command.user_id });
  const userName = getSlackDisplayName(userInfo.user);

  try {
    const placeholder = await app.client.chat.postMessage({
      channel: command.channel_id,
      text: `*${userName} searched for:* ${query}\n\n *Searching the web...*`,
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

    await app.client.chat.delete({
      channel: command.channel_id,
      ts: placeholder.ts,
    });

    await app.client.chat.postMessage({
      channel: command.channel_id,
      text: `*${userName} searched for:* ${query}\n\n*Echo:* ${answer}`,
    });
  } catch (error) {
    console.error("[Echo] /echo-search failed:", error.message);
    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "Eh... my web search is acting up. Maybe try again later?",
    });
  }
});
