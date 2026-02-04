const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:/E-File/backend/.env' });

async function checkData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const [rows] = await connection.query('SELECT document_id FROM files WHERE document_id IS NOT NULL LIMIT 5');
        console.log('Sample Document IDs in files table:');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkData();
