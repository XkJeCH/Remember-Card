const os = require('os');
const express = require("express")
const app = express()
const path = require("path")
const http = require("http")
const { Server } = require("socket.io")
const server = http.createServer(app)
const io = new Server(server)
app.use(express.static(path.resolve("")))
let arr = []
let playingArray = []
let table = [];

function getRandomTable() {
  let numbers = [];
  for (let i = 1; i <= 18; i++) {
    numbers.push(i);
  }
  let tableTemp = [];
  for (let i = 0; i < 36; i++) {
    if (numbers.length === 0) {
      for (let j = 1; j <= 18; j++) {
        numbers.push(j);
      }
    }
    const randomIndex = Math.floor(Math.random() * numbers.length);
    const randomNumber = numbers[randomIndex];
    tableTemp.push(randomNumber);
    numbers.splice(randomIndex, 1);
  }
  return tableTemp;
}
function startGame() {
  table = getRandomTable();
}
io.on("connection", (socket) => {
  socket.on("connect", () => {
    console.log("User connected with LAN IP address:", socket.client.conn.hostname);
  })
  socket.on("find", (e) => {
    if (e.name != null) {
      arr.push(e.name)
      if (arr.length >= 2) {
        let p1obj = {
          p1name: arr[0],
          p1value: "X",
          p1move: "",
          score: 0
        }
        let p2obj = {
          p2name: arr[1],
          p2value: "O",
          p2move: "",
          score: 0
        }
        let obj = {
          p1: p1obj,
          p2: p2obj,
          sum: 1
        }
        playingArray.push(obj)

        startGame();
        let gameData = { allPlayers: playingArray, table, turn: arr[0], played: [] };
        arr.splice(0, 2)
        io.emit("gameStart", gameData)
      }
    }
  })

  socket.on("clickImg", (e) => {
    io.emit("playing", e)
  })

  socket.on("updateScore", (e) => {
    io.emit("updateScore", e)
  })
  socket.on("updatePlayed", (e) => {
    io.emit("updatePlayed", e)
  })
  socket.on("gameOver", (e) => {
  })
})




app.get("/", (req, res) => {
  const lanIpAddress = req.socket.remoteAddress
  console.log(`- ผู้ใช้งาน: ${lanIpAddress}`);
  // Use 'path.join' to create an absolute file path
  const filePath = path.join(__dirname, 'game.html');
  return res.sendFile(filePath);
})



function getLocalIpAddress() {
  const ifaces = os.networkInterfaces();
  let ipAddress = null;
  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
      if (iface.internal !== false || iface.family !== 'IPv4') {
        return;
      }
      ipAddress = iface.address;
    });
  });
  return ipAddress;
}

const localIpAddress = getLocalIpAddress();
server.listen(3000, localIpAddress, () => {
  console.log("เซิฟเวอร์กำลังเชื่อมต่อที่ : " + localIpAddress + ":3000")
})
