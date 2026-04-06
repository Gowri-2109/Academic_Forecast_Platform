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
    console.log('Adding assigned_students column to tests table...');
    // Check if column exists
    const [cols] = await db.query('DESCRIBE tests');
    if (!cols.find(c => c.Field === 'assigned_students')) {
        await db.query('ALTER TABLE tests ADD COLUMN assigned_students TEXT AFTER created_by');
        console.log('Column "assigned_students" added.');
    } else {
        console.log('Column "assigned_students" already exists.');
    }

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await db.end();
    process.exit();
  }
}

run();
