const app = require("../app");
const { getAIResponse, ECHO_PERSONALITY } = require("../services/ai");
const { getProjectData } = require("../services/projectData");

app.command("/echo-project", async ({ command, ack, respond }) => {
  await ack();

  const projectName = command.text.trim();
  if (!projectName)
    return await respond("Hmm... which project? Try `/echo-project amadeus`.");

  await respond({
    response_type: "in_channel",
    text: `*Echo is gathering info on "${projectName}"...*`,
  });

  try {
    const data = await getProjectData(app, projectName, command.channel_id);

    if (!data.found) {
      return await respond({
        response_type: "in_channel",
        replace_original: true,
        text: `❌ ${data.error}`,
      });
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
### 🚀 Project Overview
### 📈 Current Status
### 👥 Team & Roles
### 🔗 Related Projects & Context
    `.trim();

    const report = await getAIResponse(
      analysisPrompt,
      ECHO_PERSONALITY + " Be analytical, clear, and highly organized.",
    );

    await respond({
      response_type: "in_channel",
      replace_original: true,
      text: `*PROJECT REPORT: ${projectName}*\n\n${report}\n\n_Source: #${data.channelName}_`,
    });
  } catch (err) {
    await respond(`Ugh, something went wrong: ${err.message}`);
  }
});
