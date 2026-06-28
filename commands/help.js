const app = require("../app");

app.command("/echo-help", async ({ ack, respond }) => {
  await ack();


  await respond({
    text: `*Echo Intro*
    Echo is a cute and super intelligent 2D girl who can help you with your team, code, and projects. She can also play music for you.

*Echo Commands*
    
*Knowledge & Search*
• /echo-ask <question>
  Ask Echo anything about your team, code, or projects.

• /echo-search <query>
  Search the web and get a summarised answer with cited sources.

• /echo-summary <today|yesterday|last N|unread>
  Summarize channels, threads, or recent discussions.
  Example: /echo-summary last 50

*Projects & Documentation*
• /echo-project <project-name>
  Retrieve project details, architecture, tasks, and discussions on slack chats.

• /echo-docs <query>
  Search technical documentation, APIs, and project docs.

*Help*
• /echo-help
  Show all available commands.`,
  });
});
