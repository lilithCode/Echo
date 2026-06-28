const app = require("./app");

require("./commands/ask");
require("./commands/summary");
require("./commands/search");
require("./commands/project");
require("./commands/docs");
require("./commands/help");
require("./events/onboarding");


(async () => {
  // once the socket is connected, start the app
  await app.start();
  console.log("Echo is Online :)");
})();
