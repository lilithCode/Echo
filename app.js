const { App } = require("@slack/bolt");
require("dotenv").config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  customRoutes: [],
});

app.error(async (error) => {
  console.error("[Echo] Unhandled Bolt error:", error);
});

module.exports = app;
