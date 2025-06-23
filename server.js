const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const users = [
  { email: "motsimabe@gmail.com", password: "1234" },
  { email: "admin@mabe.com", password: "admin123" }
];

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.listen(PORT, () => {
  console.log(`Mabe backend running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Hello from Mabe Backend!');
});
