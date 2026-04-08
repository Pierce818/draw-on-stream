const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

let connectedUsers = [];

io.on("connection", socket=>{
  console.log("User connected");

  // Assign zone
  const index = connectedUsers.length % 10; // max 10 zones
  const width = 1 / 10;
  connectedUsers.push(socket.id);
  socket.emit("zoneAssigned",{index,width});

  socket.on("draw", data=>{
    io.emit("draw", data); // send to overlay
  });

  socket.on("disconnect", ()=>{
    connectedUsers = connectedUsers.filter(id => id!==socket.id);
  });
});

const port = process.env.PORT || 3000;
http.listen(port, ()=>console.log("Server running on port "+port));