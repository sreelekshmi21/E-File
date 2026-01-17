const mysql = require('mysql2/promise');
const fs = require('fs');

async function insertDivisions() {
  try {
    // Load divisions data from JSON
    const rawData = fs.readFileSync('./divisions.json', 'utf-8');
    const divisions = JSON.parse(rawData);

    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',       // your DB host
      user: 'root',            // your DB user
      password: '',            // your DB password
      database: 'file_register_db' // your DB name
    });

    console.log(`✅ Connected to database. Inserting ${divisions.length} divisions...`);

    for (const division of divisions) {
      try {
        await connection.execute(
          `INSERT INTO divisions (code, name, department_id) VALUES (?, ?, ?)`,
          [division.code, division.name, division.department_id]
        );
        console.log(`✔ Inserted: ${division.name} (${division.code})`);
      } catch (err) {
        console.error(`❌ Failed to insert ${division.code}:`, err.message);
      }
    }

    await connection.end();
    console.log('✅ All insertions complete. Connection closed.');

  } catch (err) {
    console.error('🚫 Error:', err);
  }
}

insertDivisions();