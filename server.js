const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

let users = [
  {
    name: "Motsimabe Cambridge",
    email: "motsimabe@gmail.com",
    password: "1234",
    position: "Administrator",
    department: "IT",
    role: "admin",
    tasks: [
      "Oversee system operations",
      "Manage employee access"
    ],
    clockIns: [
      "2025-06-20T08:00:00Z",
      "2025-06-21T08:10:00Z"
    ]
  },
  {
    name: "Thato Mabe",
    email: "thato@example.com",
    password: "1234",
    position: "Administrator",
    department: "HR",
    role: "admin",
    tasks: [
      "Review employee attendance reports",
      "Approve monthly leave applications",
      "Conduct HR system audit"
    ],
    clockIns: [
      "2025-06-20T08:00:00Z",
      "2025-06-21T08:03:00Z",
      "2025-06-22T07:55:00Z"
    ]
  },
  {
    name: "Cynthia Mabe",
    email: "cynthia@example.com",
    password: "abcd",
    position: "Receptionist",
    department: "Front Desk",
    role: "employee",
    tasks: [
      "Answer calls and take messages",
      "Welcome visitors and direct them to appropriate departments",
      "Update front desk logbook"
    ],
    clockIns: [
      "2025-06-20T08:10:00Z",
      "2025-06-21T08:05:00Z"
    ]
  },
  {
    name: "Masego Mosidi",
    email: "masego@example.com",
    password: "pass123",
    position: "Data Clerk",
    department: "Admin",
    role: "employee",
    tasks: [
      "Enter supplier invoices in the database",
      "Cross-check employee timesheets",
      "Update filing system"
    ],
    clockIns: [
      "2025-06-20T08:02:00Z",
      "2025-06-21T08:04:00Z",
      "2025-06-22T07:59:00Z"
    ]
  },
  {
    name: "Mapheello Lefalatsa",
    email: "mapheello@example.com",
    password: "pass456",
    position: "Technician",
    department: "Maintenance",
    role: "employee",
    tasks: [
      "Inspect site equipment daily",
      "Fix pending electrical issues",
      "Update maintenance log"
    ],
    clockIns: [
      "2025-06-20T08:20:00Z",
      "2025-06-21T08:19:00Z"
    ]
  }
];

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

// Admin: get all employees
app.get('/employees', (req, res) => {
  const allUsers = users.map(({ password, ...rest }) => rest);
  res.json(allUsers);
});

// Employee: get own profile by email
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

app.get('/', (req, res) => {
  res.send('Hello from Mabe Backend!');
});

app.listen(PORT, () => {
  console.log(`Mabe backend running on port ${PORT}`);
});
