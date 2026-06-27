const { getCachedUserName } = require("./utils");

/**
 * Project Data Fetching Service (V3 - SMART SEARCH & NAME RESOLUTION)
 */

async function findProjectChannels(app, projectName, currentChannelId) {
  const projectNameLower = projectName.toLowerCase();
  const targetName = projectNameLower.replace(/\s+/g, "-");

  try {
    // 1. Get list of channels the bot is actually in
    const result = await app.client.conversations.list({
      types: "public_channel,private_channel",
      limit: 1000,
    });
    const channels = result.channels.filter((c) => c.is_member);

    // Strategy A: Exact Name Match (Best)
    let match = channels.find(
      (c) => c.name === targetName || c.name === projectNameLower,
    );
    if (match) return { id: match.id, name: match.name, type: "dedicated" };

    // Strategy B: Topic/Purpose Match
    match = channels.find(
      (c) =>
        (c.topic?.value || "").toLowerCase().includes(projectNameLower) ||
        (c.purpose?.value || "").toLowerCase().includes(projectNameLower),
    );
    if (match) return { id: match.id, name: match.name, type: "contextual" };

    // Strategy C: Search current channel history for mentions (The Fallback)
    try {
      const history = await app.client.conversations.history({
        channel: currentChannelId,
        limit: 50,
      });
      const hasMention = history.messages.some(
        (m) => m.text && m.text.toLowerCase().includes(projectNameLower),
      );
      if (hasMention) {
        const info = await app.client.conversations.info({
          channel: currentChannelId,
        });
        return {
          id: currentChannelId,
          name: info.channel.name,
          type: "mention_fallback",
        };
      }
    } catch (e) {}

    return null;
  } catch (err) {
    console.error("[Echo] Project discovery error:", err.message);
    return null;
  }
}

async function getProjectData(app, projectName, currentChannelId) {
  const channel = await findProjectChannels(app, projectName, currentChannelId);

  if (!channel) {
    return {
      found: false,
      error: `I couldn't find a channel named #${projectName.toLowerCase().replace(/\s+/g, "-")} or any recent mentions of "${projectName}".\n\n💡 *Tip:* If the project is private, make sure to invite me using \`/invite @Echo\`!`,
    };
  }

  try {
    const [history, info, pinsRes] = await Promise.all([
      app.client.conversations.history({ channel: channel.id, limit: 100 }),
      app.client.conversations.info({ channel: channel.id }),
      app.client.pins
        .list({ channel: channel.id })
        .catch(() => ({ items: [] })),
    ]);

    // FIX 1: Resolve User IDs to Real Names
    const processedMessages = [];
    for (const m of (history.messages || []).reverse()) {
      if (m.bot_id || !m.text) continue;

      const realName = await getCachedUserName(app, m.user);
      processedMessages.push(
        `[${new Date(m.ts * 1000).toLocaleTimeString()}] ${realName}: ${m.text}`,
      );
    }

    const pinnedText = (pinsRes.items || [])
      .filter((item) => item.type === "message")
      .map((item) => item.message.text)
      .join("\n---\n");

    return {
      found: true,
      projectName,
      channelName: channel.name,
      matchType: channel.type,
      description:
        info.channel.topic?.value ||
        info.channel.purpose?.value ||
        "No description set",
      pinnedMessages: pinnedText || "No pinned briefs found.",
      conversationHistory:
        processedMessages.join("\n") || "No conversation history found.",
    };
  } catch (err) {
    return {
      found: false,
      error: `Slack Permission Error: ${err.data?.error || err.message}`,
    };
  }
}

module.exports = { getProjectData };
