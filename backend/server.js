require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // using promise wrapper for async/await

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool setup
let db;
async function initializeDatabase() {
  try {
    db = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'academic_forecast',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Database pool created successfully.');
  } catch (err) {
    console.error('Failed to create database pool:', err);
  }
}

// Ensure the db config is loaded before routes use it
initializeDatabase();

// Route files
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const marksRoutes = require('./routes/marks');
const attendanceRoutes = require('./routes/attendance');
const assignmentRoutes = require('./routes/assignments');
const disciplinaryRoutes = require('./routes/disciplinary');
const predictionRoutes = require('./routes/prediction');
const reportRoutes = require('./routes/reports');
const subjectRoutes = require('./routes/subjects');
const facultyRoutes = require('./routes/faculties');
const studentAssignmentRoutes = require('./routes/studentAssignments');
const queryRoutes = require('./routes/queries');
const notificationRoutes = require('./routes/notifications');
const facultyAssignmentRoutes = require('./routes/facultyAssignments');
const testRoutes = require('./routes/tests');

// Apply routes
// We pass the db pool to routes by attaching it to the request object or via other dependency injection
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/disciplinary', disciplinaryRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/student-assignments', studentAssignmentRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/faculty-assignments', facultyAssignmentRoutes);
app.use('/api/tests', testRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
