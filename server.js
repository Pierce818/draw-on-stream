const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

app.use(express.static(__dirname));

let users = [];
const maxUsers = 10;

io.on("connection", (socket) => {
  console.log("user connected");

  if (!users.includes(socket.id)) users.push(socket.id);
  const zoneIndex = users.indexOf(socket.id);
  const zoneWidth = 1 / maxUsers;

  socket.emit("zoneAssigned", { index: zoneIndex, width: zoneWidth });

  socket.on("draw", (data) => io.emit("draw", { ...data, zoneIndex }));
  socket.on("disconnect", () => {
    users = users.filter(id => id !== socket.id);
  });

  socket.on("clear", () => io.emit("clear"));
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("Server running on port " + PORT));