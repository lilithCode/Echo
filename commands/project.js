const app = require("../app");
const { getAIResponse, ECHO_PERSONALITY } = require("../services/ai");
const { getProjectData } = require("../services/projectData");
const { getSlackDisplayName } = require("../services/utils");

app.command("/echo-project", async ({ command, ack, respond }) => {
  await ack();

  const projectName = command.text.trim();
  if (!projectName) {
    return await respond("Hmm... which project? Try `/echo-project amadeus`.");
  }

  try {
    const loadingMsg = await app.client.chat.postMessage({
      channel: command.channel_id,
      text: `⏳ *Analyzing project: ${projectName}...* 🔍`,
    });

    const projectData = await getProjectData(app, projectName);

    if (!projectData.found) {
      await app.client.chat.update({
        channel: command.channel_id,
        ts: loadingMsg.ts,
        text: `❌ *Error:* ${projectData.error}`,
      });
      return;
    }

    const analysisPrompt = `
Analyze this Slack project data for "${projectName}".
CHANNEL: #${projectData.channelName}
DESC: ${projectData.description}
PINS: ${projectData.pinnedMessages}
CONVO: ${projectData.conversationHistory}

Produce a brief report including:
1. Project Summary
2. Current Status (what's happening now?)
3. Key Deadlines (if any)
4. Active Team Members
    `.trim();

    const report = await getAIResponse(
      analysisPrompt,
      ECHO_PERSONALITY + " Be analytical and concise.",
    );

    await app.client.chat.update({
      channel: command.channel_id,
      ts: loadingMsg.ts,
      text: `*📊 PROJECT REPORT: ${projectName}*\n\n${report}\n\n_Ref: #${projectData.channelName}_`,
    });
  } catch (err) {
    await respond(`Something went wrong: ${err.message}`);
  }
});
