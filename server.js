const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

let userZones = {};
let votes = {};
const zoneCount = 10;

io.on("connection", socket=>{
  console.log("User connected");

  // Assign unique zone
  const usedZones = Object.values(userZones);
  let index = 0;
  while(usedZones.includes(index) && index < zoneCount) index++;
  userZones[socket.id] = index;

  socket.emit("zoneAssigned",{index, width:1/zoneCount});

  socket.on("draw", data=> io.emit("draw", data));

  socket.on("voteClear", user=>{
    votes[socket.id] = true;
    const voteCount = Object.keys(votes).length;
    const majority = Math.ceil(Object.keys(userZones).length / 2);
    if(voteCount >= majority){
      io.emit("clearCanvas");
      votes = {};
    }
  });

  socket.on("disconnect", ()=>{
    delete userZones[socket.id];
    delete votes[socket.id];
  });
});

const port = process.env.PORT || 3000;
http.listen(port, ()=>console.log("Server running on port "+port));