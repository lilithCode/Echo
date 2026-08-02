const app = require("../app");

const WELCOME_TEXT =
  "Tuturu! I'm Echo, your AI teammate in Slack.\n\nI know you're busy, so I'll help you with your work.\n\n*Here's the deal:*\n• Ask me anything (I'll have the answer in 2 sec)\n• Tell me to search (I'll find the best sources online)\n• Search the docs (I'll look into the lastest documentation online)\n• Ask me about your project (I'll gather information about it on slack)\n• Ask me to summarize (I'll make a short summary of Slack msgs)\n\n Type `/echo-help`for more details :)";

// Echo's own user ID never changes, so fetch it once and cache it instead
// of calling auth.test() on every single member_joined_channel event.
let cachedBotUserId = null;
async function getBotUserId(client) {
  if (cachedBotUserId) return cachedBotUserId;
  const { user_id } = await client.auth.test();
  cachedBotUserId = user_id;
  return cachedBotUserId;
}

app.event("app_home_opened", async ({ event, client }) => {
  try {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: "home",
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "Welcome to Echo!" },
          },
          {
            type: "section",
            text: {
              text: WELCOME_TEXT,
            },
          },
          { type: "divider" },
          {
            type: "section",
            text: {
              text: "*Core Commands:*\n• `/echo-ask` - Ask me anything\n• `/echo-summary` - Summarize the chat\n• `/echo-search` - Search the web \n• `/echo-docs` - Search the docs\n• `/echo-project` - Get project details",
            },
          },
          {
            type: "context",
            elements: [{ type: "mrkdwn", text: "Made by Lilith" }],
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error publishing Home tab:", error);
  }
});

// Send a welcome message when the bot is added to a channel
app.event("member_joined_channel", async ({ event, client }) => {
  try {
    const botUserId = await getBotUserId(client);
    // Only speak if the person joining is Echo itself
    if (event.user === botUserId) {
      await client.chat.postMessage({
        channel: event.channel,
        text: WELCOME_TEXT,
      });
    }
  } catch (error) {
    console.error("Error sending welcome message:", error);
  }
});
