const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Your full user array goes here...
let users = [ /* your detailed users */ ];

// Login endpoint
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

// Admin: see all employees
app.get('/employees', (req, res) => {
  const allUsers = users.map(({ password, ...rest }) => rest);
  res.json(allUsers);
});

// Employee: view own profile
app.get('/employee/:email', (req, res) => {
  const email = req.params.email;
  const user = users.find(u => u.email === email);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Mabe backend running on port ${PORT}`);
});
