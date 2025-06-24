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
  { name: "Cambridge Mabe", email: "motsimabe@gmail.com", password: "1234", role: "admin", status: "offline", clockIns: [], tasks: [] },
  { name: "Thato Mabe", email: "thato@example.com", password: "1234", role: "employee", status: "offline", clockIns: [], tasks: [] },
  { name: "Cynthia Mabe", email: "cynthia@example.com", password: "abcd", role: "employee", status: "offline", clockIns: [], tasks: [] },
];

// Socket events
io.on('connection', socket => {
  console.log('User connected');
  socket.on('login', email => {
    const u = users.find(x => x.email === email);
    if (u) { u.status = 'online'; u.clockIns.push(new Date().toISOString()); io.emit('userStatusUpdate'); }
  });
  socket.on('logout', email => {
    const u = users.find(x => x.email === email);
    if (u) { u.status = 'offline'; u.clockIns.push(new Date().toISOString()); io.emit('userStatusUpdate'); }
  });
});

// Routes
app.post('/login', (req, res) => {
  const u = users.find(x => x.email === req.body.email && x.password === req.body.password);
  if (!u) return res.status(401).json({ message: 'Invalid credentials' });
  const safe = { ...u }; delete safe.password;
  res.json({ message: 'Login successful', user: safe });
});

app.post('/clockout/:email', (req, res) => {
  const u = users.find(x => x.email === req.params.email);
  if (!u) return res.status(404).json({ message: 'User not found' });
  u.status = 'offline';
  u.clockIns.push(new Date().toISOString());
  io.emit('userStatusUpdate');
  res.json({ message: 'Clocked out' });
});

app.get('/employees', (req, res) => {
  const data = users.map(u => { const { password, ...rest } = u; return rest; });
  res.json(data);
});

app.get('/employee/:email', (req, res) => {
  const u = users.find(x => x.email === req.params.email);
  if (!u) return res.status(404).json({ message: 'User not found' });
  const { password, ...rest } = u;
  res.json(rest);
});

app.post('/add-employee', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ message: 'Missing fields' });
  if (users.find(x => x.email === email)) return res.status(400).json({ message: 'Employee exists' });
  const newEmp = { name, email, password, role, status: 'offline', clockIns: [], tasks: [] };
  users.push(newEmp);
  io.emit('userStatusUpdate');
  res.status(201).json({ message: 'Employee added' });
});

server.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
