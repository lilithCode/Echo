const app = require("../app");
const { getAIResponse, ECHO_PERSONALITY } = require("../services/ai");
const { getProjectData } = require("../services/projectData");

app.command("/echo-project", async ({ command, ack }) => {
  await ack();

  const projectName = command.text.trim();
  if (!projectName) {
    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "Hmm... which project? Try `/echo-project amadeus`.",
    });
    return;
  }

  try {
    const placeholder = await app.client.chat.postMessage({
      channel: command.channel_id,
      text: ` *Gathering info on "${projectName}"...*`,
    });

    const data = await getProjectData(app, projectName, command.channel_id);

    if (!data.found) {
      await app.client.chat.delete({
        channel: command.channel_id,
        ts: placeholder.ts,
      });
      await app.client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        text: `❌ ${data.error}`,
      });
      return;
    }

    const analysisPrompt = `
You are a Lead Project Manager. Create a professional, clean Status Report for: "${projectName}".

DATA SOURCE:
Channel: #${data.channelName} (${data.matchType === "mention_fallback" ? "Based on mentions in this channel" : "Dedicated project channel"})
Project Description: ${data.description}

PINNED SPECS:
${data.pinnedMessages}

CONVERSATION LOG (Real names included):
${data.conversationHistory}

REPORT INSTRUCTIONS:
1. **Focus:** Only summarize things related to "${projectName}".
2. **Context:** If people are talking about other projects (like 'Amadeus' or 'Stardance'), list them under a "Related Projects/Dependencies" section at the end. Do NOT mix them into the main summary.
3. **Team:** Identify active people by their names.
4. **Format:** Use Bold Headers, clean bullet points, and a friendly but professional tone.

STRUCTURE:
### Project Overview
### Current Status
### Team & Roles
### Related Projects & Context
    `.trim();

    const report = await getAIResponse(
      analysisPrompt,
      ECHO_PERSONALITY + " Be analytical, clear, and highly organized.",
    );

    await app.client.chat.delete({
      channel: command.channel_id,
      ts: placeholder.ts,
    });

    await app.client.chat.postMessage({
      channel: command.channel_id,
      text: `*PROJECT REPORT: ${projectName}*\n\n${report}\n\n_Source: #${data.channelName}_`,
    });
  } catch (err) {
    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: `Ugh, something went wrong: ${err.message}`,
    });
  }
});
