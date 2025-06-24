const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(bodyParser.json());

// ======== File-based user storage ========
const USERS_FILE = path.join(__dirname, 'users.json');
let users = [];

// Load users from file
function loadUsers() {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } else {
    users = [];
  }
}

// Save users to file
function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

loadUsers();

// ======== API Endpoints ========

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  user.status = 'online';
  if (!user.clockIns) user.clockIns = [];
  user.clockIns.push(new Date().toISOString());

  saveUsers();
  io.emit('userStatusUpdate');

  res.json({ message: 'Welcome!', user });
});

// Logout / Clock Out
app.post('/clockout/:email', (req, res) => {
  const user = users.find(u => u.email === req.params.email);
  if (user) {
    user.status = 'offline';
    if (!user.clockIns) user.clockIns = [];
    user.clockIns.push(new Date().toISOString());

    saveUsers();
    io.emit('userStatusUpdate');
    res.json({ message: 'Clocked out successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Get all employees (admin)
app.get('/employees', (req, res) => {
  res.json(users);
});

// Get single employee (self)
app.get('/employee/:email', (req, res) => {
  const user = users.find(u => u.email === req.params.email);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Add employee
app.post('/add-employee', (req, res) => {
  const { name, email, password, role, department, position } = req.body;

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = {
    name,
    email,
    password,
    role,
    department,
    position,
    status: 'offline',
    tasks: [],
    clockIns: []
  };

  users.push(newUser);
  saveUsers();
  io.emit('userStatusUpdate');
  res.status(201).json({ message: 'Employee added successfully' });
});

// Socket.IO connection
io.on('connection', socket => {
  console.log('New socket connected');
  socket.on('login', email => {
    console.log(`User logged in via socket: ${email}`);
  });
  socket.on('logout', email => {
    console.log(`User logged out via socket: ${email}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
