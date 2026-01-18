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

        // 1b. Check/Add 'designation' to 'signup' table
        console.log("Checking 'signup' table for 'designation' column...");
        const [designationColumns] = await connection.query("SHOW COLUMNS FROM signup LIKE 'designation'");
        if (designationColumns.length === 0) {
            await connection.query("ALTER TABLE signup ADD COLUMN designation VARCHAR(255)");
            console.log("Added 'designation' column to 'signup' table.");
        } else {
            console.log("'designation' column already exists in 'signup' table.");
        }

        // 1c. Check/Add 'fullname' to 'signup' table
        console.log("Checking 'signup' table for 'fullname' column...");
        const [fullnameColumns] = await connection.query("SHOW COLUMNS FROM signup LIKE 'fullname'");
        if (fullnameColumns.length === 0) {
            await connection.query("ALTER TABLE signup ADD COLUMN fullname VARCHAR(255)");
            console.log("Added 'fullname' column to 'signup' table.");
        } else {
            console.log("'fullname' column already exists in 'signup' table.");
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

        // 2c. Check/Add 'created_by_user_id' to 'files' table to track who created the file
        console.log("Checking 'files' table for 'created_by_user_id' column...");
        const [createdByCol] = await connection.query("SHOW COLUMNS FROM files LIKE 'created_by_user_id'");
        if (createdByCol.length === 0) {
            await connection.query("ALTER TABLE files ADD COLUMN created_by_user_id INT");
            console.log("Added 'created_by_user_id' column to 'files' table.");
        } else {
            console.log("'created_by_user_id' column already exists in 'files' table.");
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

        // 3b. Modify file_events event_type ENUM to include 'sent' and 'forwarded'
        console.log("Updating file_events event_type ENUM...");
        try {
            await connection.query(`
                ALTER TABLE file_events 
                MODIFY COLUMN event_type ENUM('created','viewed','shared','edited','approved','commented','sent','forwarded')
            `);
            console.log("Updated event_type ENUM to include 'sent' and 'forwarded'.");
        } catch (enumErr) {
            console.log("Could not update event_type ENUM:", enumErr.message);
        }

        // 4. Check/Add 'target_section', 'target_user_id', 'target_username' to 'file_events' table
        console.log("Checking 'file_events' table for target columns...");

        const [targetSectionEventsCol] = await connection.query("SHOW COLUMNS FROM file_events LIKE 'target_section'");
        if (targetSectionEventsCol.length === 0) {
            await connection.query("ALTER TABLE file_events ADD COLUMN target_section VARCHAR(255)");
            console.log("Added 'target_section' column to 'file_events' table.");
        } else {
            console.log("'target_section' column already exists in 'file_events' table.");
        }

        const [targetUserIdEventsCol] = await connection.query("SHOW COLUMNS FROM file_events LIKE 'target_user_id'");
        if (targetUserIdEventsCol.length === 0) {
            await connection.query("ALTER TABLE file_events ADD COLUMN target_user_id INT");
            console.log("Added 'target_user_id' column to 'file_events' table.");
        } else {
            console.log("'target_user_id' column already exists in 'file_events' table.");
        }

        const [targetUsernameEventsCol] = await connection.query("SHOW COLUMNS FROM file_events LIKE 'target_username'");
        if (targetUsernameEventsCol.length === 0) {
            await connection.query("ALTER TABLE file_events ADD COLUMN target_username VARCHAR(255)");
            console.log("Added 'target_username' column to 'file_events' table.");
        } else {
            console.log("'target_username' column already exists in 'file_events' table.");
        }

        // 5. Set default values for 'files' table columns that may cause INSERT errors
        console.log("Setting default values for 'files' table columns...");
        const columnsToSetDefaults = [
            { name: 'file_name', default: "''" },
            { name: 'receiver', default: "''" },
            { name: 'size', default: "0" },
            { name: 'url', default: "''" },
            { name: 'path', default: "''" },
            { name: 'inwardnum', default: "''" },
            { name: 'outwardnum', default: "''" }
        ];

        for (const col of columnsToSetDefaults) {
            try {
                await connection.query(`ALTER TABLE files ALTER COLUMN ${col.name} SET DEFAULT ${col.default}`);
                console.log(`Set default value for '${col.name}' column.`);
            } catch (alterErr) {
                // Column might not exist or already has default - skip
                console.log(`Could not set default for '${col.name}': ${alterErr.message}`);
            }
        }

        console.log('Database verification and initialization complete.');

    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await connection.end();
    }
}

initDB();
