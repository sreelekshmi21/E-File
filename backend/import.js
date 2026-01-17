const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 1. Read Excel file
const workbook = xlsx.readFile('units.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet); // array of JSON objects

// 2. DB Config from .env
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function importData() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    for (let row of data) {
      const { id, name, division_id } = row;
      const code = row['code'] ?? null;
      // Insert into MySQL
      await connection.execute(
        `INSERT INTO units (id, name, code, division_id)
         VALUES (?, ?, ?, ?)`,
        [id, name, code, division_id]
      );
    }

    console.log('✅ Import completed successfully.');
    await connection.end();
  } catch (error) {
    console.error('❌ Error importing data:', error);
  }
}

importData();