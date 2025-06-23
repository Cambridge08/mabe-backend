const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app); // Wrap express in HTTP server
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

let users = [
  {
    name: "Thato Mabe",
    email: "thato@example.com",
    password: "1234",
    role: "admin",
    status: "offline",
    clockIns: []
  },
  {
    name: "Cynthia Mabe",
    email: "cynthia@example.com",
    password: "abcd",
    role: "employee",
    status: "offline",
    clockIns: []
  }
];

// Real-time tracking
io.on('connection', (socket) => {
  console.log('🟢 A user connected');

  socket.on('login', (email) => {
    const user = users.find(u => u.email === email);
    if (user) {
      user.status = "online";
      io.emit('userStatusUpdate', users); // send updated list to all
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
    // You can add logic to mark user offline after timeout
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const { password, ...safeUser } = user;
    res.status(200).json({ message: 'Login successful', user: safeUser });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/employees', (req, res) => {
  const allUsers = users.map(({ password, ...rest }) => rest);
  res.json(allUsers);
});

app.get('/employee/:email', (req, res) => {
  const user = users.find(u => u.email === req.params.email);
  if (user) {
    const { password, ...userData } = user;
    res.json(userData);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

server.listen(PORT, () => {
  console.log(`Mabe backend with Socket.IO running on port ${PORT}`);
});
