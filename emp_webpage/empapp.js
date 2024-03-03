const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3009;

// Function to find an available port
async function findAvailablePort(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port);
    server.on('listening', () => {
      server.close(() => {
        resolve(port);
      });
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(port + 1));
      } else {
        reject(err);
      }
    });
  });
}

// Function to connect to MongoDB
// async function connectToEmployeeDatabase() {
//   try {
//     await mongoose.connect('mongodb://localhost/EmployeeDatabase', { useNewUrlParser: true, useUnifiedTopology: true });
//     console.log('Connected to Employee Database');
//   } catch (error) {
//     console.error('Error connecting to Employee Database:', error);
//     process.exit(1); // Exit the process if there's an error in connecting to the database
//   }
// }
async function connectToEmployeeDatabase() {
  try {
    await mongoose.connect('mongodb://mongo:27017/EmployeeDatabase');
    console.log('Connected to Employee Database');
  } catch (error) {
    console.error('Error connecting to Employee Database:', error);
    process.exit(1); // Exit the process if there's an error in connecting to the database
  }
}


// Schema definition for the Employee model
const employeeSchema = new mongoose.Schema({
  empID: String,
  empName: String,
  empGender: String,
  empLocation: String,
  joiningDate: Date,
  salary: Number,
  probationDate: Date,
  empEmail: String,
  empPassword: String
});

// Create the Employee model
const Employee = mongoose.model('Employee', employeeSchema);

// Middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle form submission
app.post('/submit', async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    const savedEmployee = await newEmployee.save();
    console.log('Employee added successfully:', savedEmployee);
    res.send(`
      <head>
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h2>Employee Details</h2>
        <table>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Location</th>
            <th>Joining Date</th>
            <th>Salary</th>
            <th>Probation Date</th>
            <th>Email</th>
            <th>Password</th>
          </tr>
          <tr>
            <td>${savedEmployee.empID}</td>
            <td>${savedEmployee.empName}</td>
            <td>${savedEmployee.empGender}</td>
            <td>${savedEmployee.empLocation}</td>
            <td>${savedEmployee.joiningDate}</td>
            <td>${savedEmployee.salary}</td>
            <td>${savedEmployee.probationDate}</td>
            <td>${savedEmployee.empEmail}</td>
            <td>${savedEmployee.empPassword}</td>
          </tr>
        </table>
      </body>`);
  } catch (error) {
    console.error('Error saving employee data:', error);
    res.status(500).send('Error saving employee data.');
  }
});

// Start the server
async function startEmployeeServer() {
  const availablePort = await findAvailablePort(PORT);
  await connectToEmployeeDatabase(); // Connect to Employee Database
  app.listen(availablePort, () => {
    console.log(`Employee Application Server is running on http://localhost:${availablePort}`);
  });
}

startEmployeeServer();

// Close the MongoDB connection when the application finishes
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Employee Database disconnected through app termination');
    process.exit(0);
  });
});
