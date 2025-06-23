const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Users for login
const users = [
  { email: "motsimabe@gmail.com", password: "1234" },
  { email: "admin@mabe.com", password: "admin123" }
];

// Employee data
const employees = [
  { name: "Thato Mabe", position: "Administrator" },
  { name: "Masego Mosidi", position: "Administrator" },
  { name: "Cynthia Mabe", position: "Administrator" },
  { name: "Mapheello Lefalatsa", position: "Administrator" }
];

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Employees route
app.get('/employees', (req, res) => {
  res.json(employees);
});

// Root route
app.get('/', (req, res) => {
  res.send('Hello from Mabe Backend!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Mabe backend running on port ${PORT}`);
});
