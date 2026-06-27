const app = require("../app");
const { searchDocs } = require("../services/search");

app.command("/echo-docs", async ({ command, ack, respond }) => {
  await ack();

  const query = command.text.trim();
  if (!query)
    return await respond("Hmm... You didn't tell me what to look up.");

  const userInfo = await app.client.users.info({ user: command.user_id });
  const userName = userInfo.user.real_name || userInfo.user.name;

  await respond({
    response_type: "in_channel",
    text: `*${userName}:* ${query}\n\n*Searching documentation...* `,
  });

  try {
    const { answer, sources } = await searchDocs(query);

    const sourceList =
      sources.length > 0
        ? "\n\n*Sources:*\n" +
          sources.map((s) => `• [${s.title}](${s.url})`).join("\n")
        : "";

    await respond({
      response_type: "in_channel",
      replace_original: true,
      text: `*${userName}:* ${query}\n\n*Echo:*\n\n${answer}${sourceList}`,
    });
  } catch (error) {
    await respond({
      response_type: "in_channel",
      replace_original: true,
      text: `*${userName}:* ${query}\n\n*Echo:* I couldn't search the docs right now.`,
    });
  }
});
