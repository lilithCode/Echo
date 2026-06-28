const app = require("../app");
const { searchDocs } = require("../services/search");
const { getSlackDisplayName } = require("../services/utils");

app.command("/echo-docs", async ({ command, ack }) => {
  await ack();

  const query = command.text.trim();
  if (!query) {
    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "Hmm... You didn't tell me what to look up. Try `/echo-docs nextjs app router`",
    });
    return;
  }

  const userInfo = await app.client.users.info({ user: command.user_id });
  const userName = getSlackDisplayName(userInfo.user);

  try {
    const placeholder = await app.client.chat.postMessage({
      channel: command.channel_id,
      text: `*${userName} requested docs for:* ${query}\n\n *Looking through official documentation...*`,
    });

    const { answer, sources } = await searchDocs(query);

    const sourceList =
      sources.length > 0
        ? "\n\n*Sources:*\n" +
          sources
            .map((s) => `• <${s.url}|${s.title || "Documentation Link"}>`)
            .join("\n")
        : "";

    await app.client.chat.delete({
      channel: command.channel_id,
      ts: placeholder.ts,
    });

    await app.client.chat.postMessage({
      channel: command.channel_id,
      text: `*${userName} requested docs for:* ${query}\n\n*Echo:*\n\n${answer}${sourceList}`,
    });
  } catch (error) {
    console.error("[Echo] /echo-docs failed:", error.message);
    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "Eh... I couldn't search the docs right now. Check my console logs for details.",
    });
  }
});
