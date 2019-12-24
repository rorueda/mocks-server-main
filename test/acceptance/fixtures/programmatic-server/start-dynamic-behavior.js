const path = require("path");
const { Server } = require("../../../../index");

const server = new Server(path.resolve(__dirname, "..", "web-tutorial"), {
  port: 3100,
  log: "debug",
  watch: false,
  behavior: "dynamic"
});

server.start().then(() => {
  console.log("Server started");
});