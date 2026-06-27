/**
 * Project Data Fetching Service (IMPROVED)
 */

async function findProjectChannels(app, projectName) {
  try {
    // FIX: Added 'public_channel,private_channel' to types
    // Note: Bot can only see private channels it is already invited to.
    const result = await app.client.conversations.list({
      limit: 1000,
      exclude_archived: true,
      types: "public_channel,private_channel",
    });

    const channels = result.channels;
    const projectNameLower = projectName.toLowerCase();
    const channelName = projectName.toLowerCase().replace(/\s+/g, "-");

    // Strategy 1: Exact or partial channel name match
    let projectChannel = channels.find(
      (c) =>
        c.name === channelName ||
        c.name === projectNameLower ||
        c.name.includes(projectNameLower),
    );

    if (projectChannel) {
      // If it's a public channel and we aren't in it, try to join
      if (projectChannel.is_channel && !projectChannel.is_member) {
        try {
          await app.client.conversations.join({ channel: projectChannel.id });
        } catch (e) {
          console.log(
            `[Echo] Could not join public channel ${projectChannel.name}: ${e.message}`,
          );
        }
      }

      return {
        type: "dedicated_channel",
        channel: projectChannel,
        id: projectChannel.id,
        name: projectChannel.name,
      };
    }

    // Strategy 2: Search messages in channels the bot IS a member of
    // Brute-forcing every channel is slow and hits rate limits, so we only check where we are present
    const memberChannels = channels.filter((c) => c.is_member);

    for (const channel of memberChannels) {
      try {
        const history = await app.client.conversations.history({
          channel: channel.id,
          limit: 30,
        });

        const hasMention = history.messages.some(
          (msg) =>
            msg.text && msg.text.toLowerCase().includes(projectNameLower),
        );

        if (hasMention) {
          return {
            type: "project_mention_channel",
            channel,
            id: channel.id,
            name: channel.name,
          };
        }
      } catch (err) {
        continue; // Skip restricted channels
      }
    }

    return null;
  } catch (err) {
    console.error("[Echo] findProjectChannels error:", err.message);
    return null;
  }
}

async function getProjectData(app, projectName) {
  try {
    const channelResult = await findProjectChannels(app, projectName);

    if (!channelResult) {
      return {
        found: false,
        projectName,
        error: `I couldn't find a channel for "${projectName}". 
        
If it's a private channel, please invite me first by typing \`/invite @Echo\` inside that channel!`,
      };
    }

    const channelId = channelResult.id;

    // Fetch History
    const history = await app.client.conversations.history({
      channel: channelId,
      limit: 100,
    });

    // Fetch Pinned Messages
    let pinnedText = "";
    try {
      const pins = await app.client.conversations.getPinnedMessages({
        channel: channelId,
      });
      pinnedText = (pins.messages || []).map((m) => m.text).join("\n---\n");
    } catch (e) {}

    // Fetch Channel Info (Topic/Purpose)
    const info = await app.client.conversations.info({ channel: channelId });

    // Process messages with user names
    const processedMessages = [];
    for (const msg of (history.messages || []).reverse()) {
      if (msg.bot_id || !msg.text) continue;
      processedMessages.push(
        `[${new Date(msg.ts * 1000).toLocaleTimeString()}] User ${msg.user}: ${msg.text}`,
      );
    }

    return {
      found: true,
      projectName,
      channelId,
      channelName: channelResult.name,
      channelType: channelResult.type,
      description:
        info.channel.topic?.value ||
        info.channel.purpose?.value ||
        "No description",
      pinnedMessages: pinnedText,
      conversationHistory: processedMessages.join("\n"),
      messageCount: history.messages?.length || 0,
    };
  } catch (err) {
    return { found: false, error: err.message };
  }
}

module.exports = { getProjectData };
