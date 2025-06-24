const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

let users = [
  {
    name: "Cambridge Mabe",
    email: "motsimabe@gmail.com",
    password: "1234",
    role: "admin",
    status: "offline",
    clockIns: [],
    tasks: []
  },
  // Add more employees here as needed
];

// Helper to notify clients
function broadcastUsers() {
  const publicUsers = users.map(u => {
    const { password, ...rest } = u;
    return rest;
  });
  io.emit('userStatusUpdate', publicUsers);
}

// Socket events
io.on('connection', socket => {
  console.log('🟢 A user connected');
  socket.on('disconnect', () => console.log('🔴 A user disconnected'));
});

// API routes

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  user.status = 'online';
  user.clockIns.push({ type: 'in', time: new Date().toISOString() });
  broadcastUsers();
  const { password: pw, ...safeUser } = user;
  res.json({ message: 'Login successful', user: safeUser });
});

app.post('/clockin/:email', (req, res) => {
  const u = users.find(u => u.email === req.params.email);
  if (!u) return res.status(404).json({ message: 'User not found' });
  u.status = 'online';
  u.clockIns.push({ type: 'in', time: new Date().toISOString() });
  broadcastUsers();
  res.json({ message: 'Clocked in' });
});

app.post('/clockout/:email', (req, res) => {
  const u = users.find(u => u.email === req.params.email);
  if (!u) return res.status(404).json({ message: 'User not found' });
  u.status = 'offline';
  u.clockIns.push({ type: 'out', time: new Date().toISOString() });
  broadcastUsers();
  res.json({ message: 'Clocked out' });
});

app.get('/employees', (req, res) => {
  broadcastUsers(); // ensure latest
  const publicUsers = users.map(u => {
    const { password, ...rest } = u;
    return rest;
  });
  res.json(publicUsers);
});

app.get('/employee/:email', (req, res) => {
  const u = users.find(u => u.email === req.params.email);
  if (!u) return res.status(404).json({ message: 'User not found' });
  const { password, ...rest } = u;
  res.json(rest);
});

app.post('/add-employee', (req, res) => {
  const { name, email, password, role, department = '', position = '' } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Employee already exists' });
  }
  const newEmployee = {
    name, email, password, role,
    department, position,
    status: 'offline',
    clockIns: [],
    tasks: []
  };
  users.push(newEmployee);
  broadcastUsers();
  res.status(201).json({ message: 'Employee added successfully' });
});

server.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
