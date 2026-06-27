const axios = require("axios");

function getSlackDisplayName(user) {
  return (
    user?.profile?.display_name_normalized ||
    user?.profile?.display_name ||
    user?.real_name_normalized ||
    user?.real_name ||
    user?.name ||
    "User"
  );
}

// Cache for user info to avoid repeated API calls.

const userCache = {};

/**
 * Fetch and cache Slack user information.
 *
 * @param {Object} app - Bolt app instance
 * @param {string} userId - Slack user ID
 * @returns {Promise<string>} - User's display name
 */
async function getCachedUserName(app, userId) {
  if (userCache[userId]) {
    return userCache[userId];
  }

  try {
    const userInfo = await app.client.users.info({ user: userId });
    const displayName = getSlackDisplayName(userInfo.user);
    userCache[userId] = displayName;
    return displayName;
  } catch {
    userCache[userId] = "User";
    return "User";
  }
}

function resolveUserMentions(text, mentions = {}) {
  if (!text) return text;

  return text.replace(/<@([A-Z0-9]+)>/g, (match, userId) => {
    const userName = mentions[userId];
    return userName ? `@${userName}` : match;
  });
}

function formatConversationLine(userName, text, ts) {
  const timestamp = new Date(ts * 1000);
  const timeStr = timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `[${timeStr}] @${userName}: ${text}`;
}

module.exports = {
  getSlackDisplayName,
  getCachedUserName,
  resolveUserMentions,
  formatConversationLine,
};
