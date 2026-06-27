const { App } = require("@slack/bolt");
require("dotenv").config();

// adding the required env variables here so the developer knows what to add to the .env file
const REQUIRED_ENV = [
  "SLACK_BOT_TOKEN",
  "SLACK_SIGNING_SECRET",
  "SLACK_APP_TOKEN",
  "HACKCLUB_AI_KEY",
];

const missingKeys = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingKeys.length > 0) {
  console.error(`[Echo] Missing required env vars: ${missingKeys.join(", ")}`);
  process.exit(1); 
}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

module.exports = app;
