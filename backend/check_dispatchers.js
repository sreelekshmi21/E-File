require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkUsers() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'file_register_db'
    });

    try {
        console.log('--- ALL ROLES ---');
        const [roles] = await connection.query("SELECT * FROM roles");
        console.table(roles);

        console.log('\n--- USERS in OGS department ---');
        const [ogsUsers] = await connection.query(`
            SELECT s.id, s.username, s.fullname, s.department, s.role_id, r.code, r.name as role_name 
            FROM signup s
            LEFT JOIN roles r ON s.role_id = r.id
            WHERE LOWER(s.department) = 'ogs'
        `);
        console.table(ogsUsers);

        console.log('\n--- TESTING FILTER: role_code=DISPATCH ---');
        const [filtered] = await connection.query(`
            SELECT s.id, s.username, r.code, r.name as role_name 
            FROM signup s
            LEFT JOIN roles r ON s.role_id = r.id
            WHERE (LOWER(r.code) = 'dispatch' OR LOWER(r.name) = 'despatcher')
        `);
        console.table(filtered);

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkUsers();
