const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

const zoneWidth = 0.225;
const zoneColors = ["#FF6B6B","#4ECDC4","#45B7D1","#FED766","#A29BFE","#FD79A8","#55EFC4","#FDCB6E"];
let viewers = []; // { id, username, index, color }
let votesToClear = new Set();

io.on("connection", socket => {
  let user = null;

  socket.on("setType", type => {
    if (type === "viewer") {
      const index = viewers.length;
      const color = zoneColors[index % zoneColors.length];
      user = { id: socket.id, username: "", index, color };
      viewers.push(user);

      socket.emit("zoneAssigned", { index, width: zoneWidth, color });

      // Send existing named users to the new viewer
      const existing = viewers.filter(v => v.id !== socket.id && v.username);
      if (existing.length > 0) {
        socket.emit("userList", existing.map(v => ({
          user: v.username, zoneIndex: v.index, color: v.color
        })));
      }
    }
    // overlay type: no zone assignment, not counted for votes
  });

  socket.on("setUsername", username => {
    if (!user) return;
    const old = user.username;
    user.username = username;
    if (old) io.emit("userLeft", { user: old });
    io.emit("userUpdate", { user: username, zoneIndex: user.index, color: user.color });
  });

  socket.on("draw", data => {
    socket.broadcast.emit("draw", data);
  });

  socket.on("voteClear", () => {
    if (!user) return;
    votesToClear.add(socket.id);
    const needed = Math.ceil(viewers.length / 2);
    if (votesToClear.size >= needed) {
      io.emit("clearCanvas");
      votesToClear.clear();
    }
  });

  socket.on("disconnect", () => {
    if (user) {
      if (user.username) io.emit("userLeft", { user: user.username });
      viewers = viewers.filter(v => v.id !== socket.id);
      votesToClear.delete(socket.id);
    }
  });
});

server.listen(process.env.PORT || 3000, () => console.log("Server running"));
