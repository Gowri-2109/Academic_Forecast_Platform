CREATE DATABASE IF NOT EXISTS academic_forecast;
USE academic_forecast;

-- Drop tables if they exist to allow clean re-initialization (optional, but good for test scripts)
-- DROP TABLE IF EXISTS predictions, disciplinary_records, assignments, attendance, marks, subjects, students, users;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Faculty', 'Student') NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  register_number VARCHAR(50) UNIQUE NOT NULL,
  department VARCHAR(100),
  semester INT,
  user_id INT, -- link to users table for student login
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_name VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS marks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  subject_id INT,
  internal_mark INT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(student_id, subject_id) -- one mark record per student per subject
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  subject_id INT,
  percentage DECIMAL(5,2),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  subject_id INT,
  status ENUM('Submitted', 'Missing') DEFAULT 'Missing',
  score INT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS disciplinary_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  issue_type VARCHAR(100),
  description TEXT,
  date DATE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  performance_level VARCHAR(50),
  risk_level VARCHAR(255),
  generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Insert Demo Data
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@college.edu', '$2b$10$YourHashedPasswordHere', 'Admin'),
('Faculty One', 'faculty@college.edu', '$2b$10$YourHashedPasswordHere', 'Faculty'),
('John Doe', 'john@student.edu', '$2b$10$YourHashedPasswordHere', 'Student');
