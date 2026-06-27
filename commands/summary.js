const app = require("../app");
const { getAIResponse, ECHO_PERSONALITY } = require("../services/ai");
const {
  getSlackDisplayName,
  getCachedUserName,
  resolveUserMentions,
  formatConversationLine,
} = require("../services/utils");

app.command("/echo-summary", async ({ command, ack }) => {
  await ack();

  const args = command.text.trim().toLowerCase().split(" ");
  const type = args[0] || "last";

  const userInfo = await app.client.users.info({ user: command.user_id });
  const userName = getSlackDisplayName(userInfo.user);

  let options = { channel: command.channel_id, limit: 100 };
  let label = "recent history";

  if (type === "today") {
    options.oldest = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    label = "today's messages";
  } else if (type === "yesterday") {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    options.oldest = Math.floor(start.setHours(0, 0, 0, 0) / 1000);

    const end = new Date();
    end.setDate(end.getDate() - 1);
    options.latest = Math.floor(end.setHours(23, 59, 59, 999) / 1000);
    label = "yesterday's messages";
  } else if (type === "last") {
    options.limit = parseInt(args[1]) || 20;
    label = `the last ${options.limit} messages`;
  } else if (type === "unread") {
    options.limit = 50;
    label = "unread/recent discussions";
  }

  try {
    const placeholder = await app.client.chat.postMessage({
      channel: command.channel_id,
      text: ` *Reading through ${label} to generate a summary...*`,
    });

    const result = await app.client.conversations.history(options);

    if (!result.messages || result.messages.length === 0) {
      await app.client.chat.delete({
        channel: command.channel_id,
        ts: placeholder.ts,
      });
      await app.client.chat.postMessage({
        channel: command.channel_id,
        text: `No messages found for ${label}. Keep it chill!`,
      });
      return;
    }

    // Cache user info to avoid duplicate API calls
    const nameMap = {};
    // Build a detailed conversation with metadata
    const conversationLines = [];
    // Sort messages chronologically (API returns newest-first)
    const sortedMessages = result.messages.filter((m) => !m.bot_id).reverse();

    for (const msg of sortedMessages) {
      // Fetch user name once and cache it
      if (!nameMap[msg.user]) {
        nameMap[msg.user] = await getCachedUserName(app, msg.user);
      }
      const msgUserName = nameMap[msg.user];
      const resolvedText = resolveUserMentions(msg.text, nameMap);
      let line = formatConversationLine(msgUserName, resolvedText, msg.ts);

      // If the message has reactions, add them for context
      if (msg.reactions && msg.reactions.length > 0) {
        const reactionEmojis = msg.reactions.map((r) => r.name).join(" ");
        line += ` (reactions: ${reactionEmojis})`;
      }
      // If this is a reply to someone, note that
      if (msg.thread_ts && msg.thread_ts !== msg.ts) {
        line += ` [in thread]`;
      }
      conversationLines.push(line);
    }

    const conversationText = conversationLines.join("\n");

    const summaryPrompt = `
You are summarizing a Slack conversation. Create a DETAILED summary that preserves WHO SAID WHAT.

IMPORTANT: When you mention a statement or idea, attribute it to the person by their actual name (not with @ mention, just their name). This is a summary document, not a real Slack message, so don't use @ mentions in the output.

CONVERSATION TIMELINE:
${conversationText}

TASK:
1. Group the conversation by topics/themes discussed
2. FOR EACH POINT, clearly attribute it to who said it (e.g., "Alice mentioned that...", "Bob asked...")
3. Highlight any action items or decisions made (with WHO is responsible)
4. Note any important questions that were raised
5. Call out any disagreements or different viewpoints
6. Keep it comprehensive — don't leave out key details

FORMAT YOUR SUMMARY LIKE THIS:
**Topic 1: [topic name]**
Alice brought up [idea] and Bob responded with [counterpoint]...

**Action Items:**
• Dave will [do this] by [when]
• Sarah needs to [do this]

**Key Decisions:**
• The team agreed that [decision]

Start the summary now:
    `.trim();

    const summary = await getAIResponse(
      summaryPrompt,
      ECHO_PERSONALITY,
      "google/gemini-2.5-flash",
    );

    await app.client.chat.delete({
      channel: command.channel_id,
      ts: placeholder.ts,
    });

    await app.client.chat.postMessage({
      channel: command.channel_id,
      text: `*Echo Summary (${label}):*\n\n${summary}`,
    });
  } catch (error) {
    console.error("[Echo] /echo-summary failed:", error);
    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "I had trouble reading the history. Is the Echo bot invited to this channel?",
    });
  }
});
