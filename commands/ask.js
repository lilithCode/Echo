const app = require("../app");
const { getAIResponse } = require("../services/ai");
const { getSlackDisplayName } = require("../services/utils");

app.command("/echo-ask", async ({ command, ack }) => {
  // `ack()` must be called within 3 seconds of receiving the command or Slack will show a timeout error to the user
  await ack();

  const question = command.text.trim();

  if (!question) {
    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "Hmm... you didn't ask me anything. Try `/echo-ask what is recursion?`",
    });
    return;
  }

  try {
    const userInfo = await app.client.users.info({ user: command.user_id });
    const userName = getSlackDisplayName(userInfo.user);

    // Post the placeholder and grab its timestamp
    const placeholder = await app.client.chat.postMessage({
      channel: command.channel_id,
      text: `*${userName} asked:* ${question}\n\n *Echo is thinking...*`,
    });

    const answer = await getAIResponse(question);

    // Delete the placeholder, then post the final answer 
    await app.client.chat.delete({
      channel: command.channel_id,
      ts: placeholder.ts,
    });

    await app.client.chat.postMessage({
      channel: command.channel_id,
      text: `*${userName} asked:* ${question}\n\n*Echo:* ${answer}`,
    });
  } catch (err) {
    console.error("[Echo] /echo-ask failed:", err.message);
    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: `Eh... Something went wrong with network. Try again later?`,
    });
  }
});
