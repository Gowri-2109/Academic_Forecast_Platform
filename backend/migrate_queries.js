const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'academic_forecast'
  });
  
  try {
    await db.query("ALTER TABLE queries ADD COLUMN target_role ENUM('Admin', 'Faculty') DEFAULT 'Admin'");
    console.log('Added target_role');
  } catch (e) {
    console.log(e.message);
  }
  
  try {
    await db.query("ALTER TABLE queries ADD COLUMN assigned_to INT DEFAULT NULL");
    console.log('Added assigned_to');
  } catch (e) {
    console.log(e.message);
  }
  
  process.exit();
}
run();
