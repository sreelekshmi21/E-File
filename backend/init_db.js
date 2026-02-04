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

        // 3. Check/Add 'code' and 'description' columns to roles table
        console.log("Checking 'roles' table for 'code' and 'description' columns...");
        const [codeCol] = await connection.query("SHOW COLUMNS FROM roles LIKE 'code'");
        if (codeCol.length === 0) {
            await connection.query("ALTER TABLE roles ADD COLUMN code VARCHAR(50)");
            console.log("Added 'code' column to 'roles' table.");
        } else {
            console.log("'code' column already exists in 'roles' table.");
        }

        const [descCol] = await connection.query("SHOW COLUMNS FROM roles LIKE 'description'");
        if (descCol.length === 0) {
            await connection.query("ALTER TABLE roles ADD COLUMN description VARCHAR(255)");
            console.log("Added 'description' column to 'roles' table.");
        } else {
            console.log("'description' column already exists in 'roles' table.");
        }

        // 3b. Add new workflow-based roles
        console.log("Checking and adding new workflow-based roles...");
        const newRoles = [
            { code: 'INWARD', name: 'Inward Desk', description: 'Scans physical documents and creates Document ID' },
            { code: 'DESK', name: 'Desk A/B/C/D', description: 'Creates and processes files' },
            { code: 'ADMIN', name: 'Administrator (DeskE)', description: 'Supervisory control and audit monitoring' },
            { code: 'APPROVER', name: 'Approval Authority', description: 'Final decision maker' },
            { code: 'DISPATCH', name: 'Despatcher', description: 'Dispatches files externally or internally' },
            { code: 'SYSTEM', name: 'System', description: 'Auto exit notifications' }
        ];

        for (const role of newRoles) {
            const [existingRole] = await connection.query("SELECT * FROM roles WHERE code = ?", [role.code]);
            if (existingRole.length === 0) {
                await connection.query(
                    "INSERT INTO roles (code, name, description) VALUES (?, ?, ?)",
                    [role.code, role.name, role.description]
                );
                console.log(`Added '${role.name}' role with code '${role.code}'.`);
            } else {
                console.log(`Role with code '${role.code}' already exists.`);
            }
        }

        // 3c. Check/Add 'Manager' role (legacy)
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

        // 5. Check/Add 'document_id' column to 'files' table for scanned document tracking
        console.log("Checking 'files' table for 'document_id' column...");
        const [documentIdCol] = await connection.query("SHOW COLUMNS FROM files LIKE 'document_id'");
        if (documentIdCol.length === 0) {
            await connection.query("ALTER TABLE files ADD COLUMN document_id VARCHAR(50)");
            console.log("Added 'document_id' column to 'files' table.");
        } else {
            console.log("'document_id' column already exists in 'files' table.");
        }

        // 6. Create document_counter table for generating unique Document IDs
        console.log("Checking for 'document_counter' table...");
        const [docCounterTable] = await connection.query("SHOW TABLES LIKE 'document_counter'");
        if (docCounterTable.length === 0) {
            await connection.query(`
                CREATE TABLE document_counter (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    department VARCHAR(50) NOT NULL,
                    count INT DEFAULT 0,
                    year INT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_dept_year (department, year)
                )
            `);
            // Initialize with GLOBAL counter for current year
            const currentYear = new Date().getFullYear();
            await connection.query("INSERT INTO document_counter (department, count, year) VALUES ('GLOBAL', 0, ?)", [currentYear]);
            console.log("Created 'document_counter' table and initialized GLOBAL counter.");
        } else {
            // Check if 'year' column exists, add if not
            console.log("Checking 'document_counter' table for 'year' column...");
            const [yearCol] = await connection.query("SHOW COLUMNS FROM document_counter LIKE 'year'");
            if (yearCol.length === 0) {
                const currentYear = new Date().getFullYear();
                await connection.query("ALTER TABLE document_counter ADD COLUMN year INT NOT NULL DEFAULT ?", [currentYear]);
                console.log("Added 'year' column to 'document_counter' table.");

                // Remove old unique constraint and add new one
                try {
                    await connection.query("ALTER TABLE document_counter DROP INDEX department");
                } catch (e) {
                    console.log("Could not drop old 'department' unique constraint (may not exist).");
                }
                try {
                    await connection.query("ALTER TABLE document_counter ADD UNIQUE KEY unique_dept_year (department, year)");
                    console.log("Added unique constraint on (department, year).");
                } catch (e) {
                    console.log("Could not add unique constraint (may already exist).");
                }
            } else {
                console.log("'year' column already exists in 'document_counter' table.");
            }
        }

        // 6b. Check/Add 'document_id' column to 'attachments' table
        console.log("Checking 'attachments' table for 'document_id' column...");
        try {
            const [attachmentsTable] = await connection.query("SHOW TABLES LIKE 'attachments'");
            if (attachmentsTable.length > 0) {
                const [docIdColAtt] = await connection.query("SHOW COLUMNS FROM attachments LIKE 'document_id'");
                if (docIdColAtt.length === 0) {
                    await connection.query("ALTER TABLE attachments ADD COLUMN document_id VARCHAR(50)");
                    console.log("Added 'document_id' column to 'attachments' table.");
                } else {
                    console.log("'document_id' column already exists in 'attachments' table.");
                }

                // Also check for 'comment_id' which is used in server.js
                const [commentIdColAtt] = await connection.query("SHOW COLUMNS FROM attachments LIKE 'comment_id'");
                if (commentIdColAtt.length === 0) {
                    await connection.query("ALTER TABLE attachments ADD COLUMN comment_id INT");
                    console.log("Added 'comment_id' column to 'attachments' table.");
                }
            } else {
                // If table doesn't exist, create it (basic schema)
                await connection.query(`
                    CREATE TABLE attachments (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        file_id INT,
                        path VARCHAR(255),
                        filename VARCHAR(255),
                        document_id VARCHAR(50),
                        comment_id INT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                console.log("Created 'attachments' table.");
            }
        } catch (attTableErr) {
            console.log("Error verifying 'attachments' table:", attTableErr.message);
        }

        // 6c. Check/Create 'notes' table
        console.log("Checking for 'notes' table...");
        const [notesTable] = await connection.query("SHOW TABLES LIKE 'notes'");
        if (notesTable.length === 0) {
            await connection.query(`
                CREATE TABLE notes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    file_id INT,
                    user_id INT,
                    note TEXT,
                    created_by INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("Created 'notes' table.");
        }

        // 6d. Check/Create 'user_roles' table for multi-role support
        console.log("Checking for 'user_roles' table...");
        const [userRolesTable] = await connection.query("SHOW TABLES LIKE 'user_roles'");
        if (userRolesTable.length === 0) {
            await connection.query(`
                CREATE TABLE user_roles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    role_id INT NOT NULL,
                    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_user_role (user_id, role_id)
                )
            `);
            console.log("Created 'user_roles' table.");

            // Migration: Move existing role_id from signup to user_roles
            console.log("Migrating existing roles from signup to user_roles...");
            const [users] = await connection.query("SELECT id, role_id FROM signup WHERE role_id IS NOT NULL");
            for (const user of users) {
                await connection.query(
                    "INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)",
                    [user.id, user.role_id]
                );
            }
            console.log(`Migrated roles for ${users.length} users.`);
        } else {
            console.log("'user_roles' table already exists.");
        }

        // 6e. Check/Create 'notifications' table for user notifications
        console.log("Checking for 'notifications' table...");
        const [notificationsTable] = await connection.query("SHOW TABLES LIKE 'notifications'");
        if (notificationsTable.length === 0) {
            await connection.query(`
                CREATE TABLE notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    file_id INT,
                    file_name VARCHAR(255),
                    message TEXT NOT NULL,
                    type ENUM('APPROVED', 'REJECTED', 'Query_Raised', 'FORWARDED', 'INFO') DEFAULT 'INFO',
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by_user_id INT,
                    INDEX idx_user_id (user_id),
                    INDEX idx_is_read (is_read)
                )
            `);
            console.log("Created 'notifications' table.");
        } else {
            console.log("'notifications' table already exists.");
        }

        // 7. Set default values for 'files' table columns that may cause INSERT errors
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
