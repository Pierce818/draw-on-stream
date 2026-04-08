const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

app.use(express.static(__dirname));

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("draw", (data) => io.emit("draw", data));
  socket.on("clear", () => io.emit("clear"));
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("Server running on port " + PORT));