const app = require("../app");
const { getAIResponse } = require("../services/ai");

app.command("/echo-ask", async ({ command, ack, respond }) => {
  // `ack()` must be called within 3 seconds of receiving the command or Slack will show a timeout error to the user
  await ack();

  const question = command.text.trim();

  if (!question) {
    return await respond(
      "Hmm... you didn't ask me anything. Try `/echo-ask what is recursion?`",
    );
  }

  try {
    const userInfo = await app.client.users.info({ user: command.user_id });
    const userName = userInfo.user.real_name || userInfo.user.name;

    const answer = await getAIResponse(question);

    await respond({
      text: `*${userName}:* ${question}\n\n*Echo:* ${answer}`,
    });
  } catch (err) {
    console.error("[Echo] /echo-ask failed:", err.message);
    await respond("Eh... Something went wrong with network. Try again later?");
  }
});
