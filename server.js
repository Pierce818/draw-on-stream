const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

let connectedUsers = [];
let votes = {};
const zoneCount = 10;

io.on("connection", socket=>{
  console.log("User connected");

  const index = connectedUsers.length % zoneCount;
  connectedUsers.push(socket.id);
  socket.emit("zoneAssigned",{index,width:1/zoneCount});

  // Broadcast drawing
  socket.on("draw", data=>io.emit("draw", data));

  // Vote to clear
  socket.on("voteClear", user=>{
    votes[socket.id] = true;
    const voteCount = Object.keys(votes).length;
    const majority = Math.ceil(connectedUsers.length/2);

    if(voteCount >= majority){
      io.emit("clearCanvas");
      votes = {}; // reset
    }
  });

  socket.on("disconnect", ()=>{
    connectedUsers = connectedUsers.filter(id => id!==socket.id);
    delete votes[socket.id];
  });
});

const port = process.env.PORT || 3000;
http.listen(port, ()=>console.log("Server running on port "+port));