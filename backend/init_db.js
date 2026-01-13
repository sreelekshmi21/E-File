require('dotenv').config();
const mysql = require('mysql2/promise');

async function initDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'file_register_db',
        port: process.env.DB_PORT
    });

    try {
        console.log('Connected to database.');

        // 1. Check/Add 'section' to 'signup' table
        console.log("Checking 'signup' table for 'section' column...");
        const [signupColumns] = await connection.query("SHOW COLUMNS FROM signup LIKE 'section'");
        if (signupColumns.length === 0) {
            await connection.query("ALTER TABLE signup ADD COLUMN section VARCHAR(255)");
            console.log("Added 'section' column to 'signup' table.");
        } else {
            console.log("'section' column already exists in 'signup' table.");
        }

        // 2. Check/Add 'target_user_id' and 'target_section' to 'files' table
        console.log("Checking 'files' table for 'target_user_id' and 'target_section' columns...");

        const [targetUserCol] = await connection.query("SHOW COLUMNS FROM files LIKE 'target_user_id'");
        if (targetUserCol.length === 0) {
            await connection.query("ALTER TABLE files ADD COLUMN target_user_id INT");
            console.log("Added 'target_user_id' column to 'files' table.");
        } else {
            console.log("'target_user_id' column already exists in 'files' table.");
        }

        const [targetSectionCol] = await connection.query("SHOW COLUMNS FROM files LIKE 'target_section'");
        if (targetSectionCol.length === 0) {
            await connection.query("ALTER TABLE files ADD COLUMN target_section VARCHAR(255)");
            console.log("Added 'target_section' column to 'files' table.");
        } else {
            console.log("'target_section' column already exists in 'files' table.");
        }

        // 3. Check/Add 'Manager' role
        console.log("Checking for 'Manager' role...");
        const [roles] = await connection.query("SELECT * FROM roles WHERE name = 'Manager'");
        if (roles.length === 0) {
            await connection.query("INSERT INTO roles (name) VALUES ('Manager')");
            console.log("Added 'Manager' role.");
        } else {
            console.log("'Manager' role already exists.");
        }

        console.log('Database verification and initialization complete.');

    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await connection.end();
    }
}

initDB();
