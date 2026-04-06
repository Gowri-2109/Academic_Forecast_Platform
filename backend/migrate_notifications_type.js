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
    console.log('Adding type column to notifications table...');
    // Check if column exists first
    const [cols] = await db.query('DESCRIBE notifications');
    if (!cols.find(c => c.Field === 'type')) {
        await db.query('ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT "general" AFTER message');
        console.log('Column "type" added.');
    } else {
        console.log('Column "type" already exists.');
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
