const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

const zoneWidth = 0.225; // 22.5% width per zone (50% bigger)
let connectedUsers = [];
let votesToClear = {};

io.on("connection", socket => {
  let index = connectedUsers.length;
  connectedUsers.push(socket.id);

  // Assign zone to new user
  socket.emit("zoneAssigned", { index, width: zoneWidth });

  // Handle drawing
  socket.on("draw", data => {
    io.emit("draw", data); // broadcast to all overlays
  });

  // Handle vote to clear
  socket.on("voteClear", username => {
    votesToClear[username] = true;
    // Majority vote = half+1
    if(Object.keys(votesToClear).length >= Math.ceil(connectedUsers.length/2)){
      io.emit("clearCanvas");
      votesToClear = {};
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter(id => id !== socket.id);
  });
});

server.listen(process.env.PORT || 3000, () => console.log("Server running"));