require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET;

const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = 5000;
const mysql = require("mysql2");
const fs = require('fs');

// async function insertDivisions() {
//   try {
//     // Load divisions data from JSON
//     const rawData = fs.readFileSync('./divisions.json', 'utf-8');
//     const divisions = JSON.parse(rawData);

//     // Connect to MySQL
//     const connection = await mysql.createConnection({
//       host: 'localhost',       // your DB host
//       user: 'root',            // your DB user
//       password: '',            // your DB password
//       database: 'your_db_name' // your DB name
//     });

//     console.log(`✅ Connected to database. Inserting ${divisions.length} divisions...`);

//     for (const division of divisions) {
//       try {
//         await connection.execute(
//           `INSERT INTO divisions (code, name, department_id) VALUES (?, ?, ?)`,
//           [division.code, division.name, division.department_id]
//         );
//         console.log(`✔ Inserted: ${division.name} (${division.code})`);
//       } catch (err) {
//         console.error(`❌ Failed to insert ${division.code}:`, err.message);
//       }
//     }

//     await connection.end();
//     console.log('✅ All insertions complete. Connection closed.');

//   } catch (err) {
//     console.error('🚫 Error:', err);
//   }
// }

// insertDivisions();


// const authenticateToken = require('./middleware/auth');

const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; // Format: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });

    req.user = user; // Attach user info to request
    next();
  });
}

module.exports = authenticateToken;





app.use(cors());
app.use(express.json());





// Serve static files from 'uploads' folder
app.use('/uploads', express.static('uploads'));


// MySQL Connection
const db = mysql.createConnection({
  // host: "localhost",
  // user: "root",       // your MySQL username
  // password: "",   // your MySQL password
  // database: "file_register_db"
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


// Wrap the connection with promise interface
const dbPromise = db.promise();

module.exports = dbPromise;

db.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});


// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // save files in uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});

const upload = multer({ storage: storage });

// Upload endpoint
// app.post("/upload", upload.single("file"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }
//   res.json({
//     message: "File uploaded successfully",
//     file: req.file
//   });
// });
app.post('/upload', upload.array('file', 10), async (req, res) => {
  try {

    // const file_id = req.body.file_id;

    // if (!file_id) {
    //   return res.status(400).json({ error: 'file_id is required' });
    // }

    const files = req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      size: file.size,
      url: `http://localhost:5000/uploads/${file.filename}`
    }));

     const insertQuery = 'INSERT INTO attachments (path) VALUES ?';
     const values = files.map(file => [file.path]);

      db.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error('DB insert error:', err);
      return res.status(500).json({ error: 'Failed to insert file paths' });
    }

    res.status(200).json({
      message: 'Files uploaded and paths saved to database',
      fileCount: result.affectedRows,
      paths: values.flat()
    });
  });


//      const sql = `
//      INSERT INTO files (
//      file_id,
//   file_name,
//   file_subject,
//   sender,
//   receiver,
//   date_added,
//   inwardnum,
//   outwardnum,
//   current_status,
//   remarks,
//   department,
//   path,
//   size,
//   url
// ) VALUES ?
//     `;
//    // Format values for bulk insert
//     // const values = files.map(f => [f.size, f.path, f.url]);
//     const values = files.map(f => [
//       f.file_id,
//   f.file_name,
//   f.file_subject,
//   f.sender,
//   f.receiver,
//   f.date_added,     // 'YYYY-MM-DD' or new Date()
//   f.inwardnum,
//   f.outwardnum,
//   f.current_status,
//   f.remarks,
//   f.department,
//   f.path,
//   f.size,
//   f.url
// ]);

//     try {
//   const [result] = await db.promise().query(sql, [values]);
//   console.log('Insert successful:', result);
// } catch (err) {
//   console.error('Insert failed:', err);
// }



    // await File.insertMany(files);
    // res.status(200).json({ message: 'Files uploaded successfully', files: files });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading files', details: error.message});
  }
});
// Route to handle multiple file uploads
// app.post('/upload', upload.array('file', 10), (req, res) => {
//     res.status(200).json({ message: 'Files uploaded successfully!', file: req.file });
// });



// POST route to insert comment
// app.post('/api/comments', (req, res) => {
//   const { file_id, user_id, comment } = req.body;

//   if (!file_id || !user_id || !comment) {
//     return res.status(400).json({ error: 'File number is required' });
//   }

//   const fileQuery = "SELECT id FROM files WHERE file_id = ?";
// db.query(fileQuery, [file_id], (err, result) => {
//   if (err) {
//     console.error("DB error:", err);
//     return res.status(500).json({ error: "Database error while fetching file ID" });
//   }

//   if (result.length === 0) {
//     return res.status(400).json({ error: "Invalid file_id. No matching file found." });
//   }

//   const numericFileId = result[0].id;


//   const sql = "INSERT INTO comments (file_id, user_id, comment) VALUES (?, ?, ?)";
//   db.query(sql, [numericFileId, user_id, comment], (err, result) => {
//     if (err) {
//       console.error("Error inserting comment:", err);
//       return res.status(500).json({ error: 'Failed to insert comment' });
//     }
//     res.status(200).json({ message: 'Comment added successfully', commentId: result.insertId });
//   });
// });
// })


app.post('/api/comments', upload.array("file", 10), (req, res) => {
  const { file_id, user_id, comment } = req.body;
  const attachments = req.files;

  if (!file_id || !user_id || !comment) {
    return res.status(400).json({ error: 'File number, user, and comment are required' });
  }

  const fileQuery = "SELECT id FROM files WHERE file_id = ?";
  db.query(fileQuery, [file_id], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error while fetching file ID" });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "Invalid file_id. No matching file found." });
    }

    const numericFileId = result[0].id;

    const commentSql = "INSERT INTO comments (file_id, user_id, comment) VALUES (?, ?, ?)";
    db.query(commentSql, [numericFileId, user_id, comment], (err, commentResult) => {
      if (err) {
        console.error("Error inserting comment:", err);
        return res.status(500).json({ error: 'Failed to insert comment' });
      }

      const commentId = commentResult.insertId;

      // ✅ If no attachments, respond now
      if (!attachments || attachments.length === 0) {
        return res.status(201).json({
          message: "Comment created without attachments.",
          commentId,
          file_id
        });
      }

      // ✅ Insert attachments
      const insertAttachmentsQuery = `
        INSERT INTO attachments (file_id, path, filename,comment_id)
        VALUES ?
      `;

      const attachmentValues = attachments.map((file) => [
        numericFileId,           // foreign key to comments
        file.path,
        file.originalname,
        commentId
      ]);

      db.query(insertAttachmentsQuery, [attachmentValues], (attErr, attResult) => {
        if (attErr) {
          console.error("Attachment insert error:", attErr);
          return res.status(500).json({
            error: "Comment saved, but failed to save attachments",
            commentId
          });
        }

        // ✅ Only ONE response here
        return res.status(201).json({
          message: "Comment and attachments uploaded successfully",
          commentId,
          attachment_count: attachments.length
        });
      });
    });
  });
});



app.get("/", (req, res) => {
  res.send("Backend is up ✅");
});











app.post("/signup", async (req, res) => {
  const { username, password, email, department } = req.body;

  try {
    // Check if username already exists
    const checkUserQuery = "SELECT username FROM signup WHERE username = ?";
    db.query(checkUserQuery, [username], async (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.length > 0) {
        return res.status(400).json({ error: "Username already exists!" });
      }

      // Hash password before storing
      // const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const insertQuery =
        "INSERT INTO signup (username, passwd, email, department) VALUES (?, ?, ?, ?)";
      db.query(
        insertQuery,
        [username, password, email, department],
        (err, result) => {
          if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({ error: "Failed to register user" });
          }
          return res.status(201).json({ message: "Signed up successfully!" });
        }
      );
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Login API
// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   // Validate input
//   if (!username || !password) {
//     return res.status(400).json({ error: "Username and password are required" });
//   }

//   // Check user in DB
//   const sql = "SELECT * FROM signup WHERE username = ? AND passwd = ?";
//   db.query(sql, [username, password], (err, results) => {
//     if (err) {
//       console.error("❌ Database error:", err);
//       return res.status(500).json({ error: "Database error" });
//     }

//     if (results.length === 0) {
//       return res.status(401).json({ error: "Invalid username or password" });
//     }

//     const token = jwt.sign(
//     { id: results[0].id, username: results[0].username, role_id: results[0].role_id },
//     SECRET_KEY,
//     { expiresIn: '1h' }
//   );

//   const [permissions] = await dbPromise.query(
//     `SELECT p.permission_name
//      FROM role_permissions rp
//      JOIN permissions p ON rp.permission_id = p.id
//      WHERE rp.role_id = ?`,
//     [user.role_id]
//   );

//     const permissionNames = permissions.map(p => p.permission_name);

//     if (results.length > 0) {
//       // ✅ Login success
//       res.json({
//         message: "Login successful!",
//         user: {
//           id: results[0].id,
//           username: results[0].username,
//           email: results[0].email,
//           department: results[0].department,
//           role_id: results[0].role_id,
//           token: token
//         },
//         permissions: permissionNames
//       });
//     } else {
//       // ❌ Wrong username or password
//       res.status(401).json({ error: "Invalid username or password" });
//     }
//   });

// });
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    // ✅ Use promise-based query instead of callback
    const [results] = await db.promise().query(
      "SELECT * FROM signup WHERE username = ? AND passwd = ?",
      [username, password]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];

    // ✅ Fetch permissions for the user's role
    const [permissions] = await db.promise().query(
      `SELECT p.name
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?`,
      [user.role_id]
    );

    const permissionNames = permissions.map(p => p.name);

    const token = jwt.sign(
      { id: user.id, username: user.username, role_id: user.role_id },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    // ✅ Success
    res.json({
      message: "Login successful!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        department: user.department,
        role_id: user.role_id,
        token: token,
      },
      permissions: permissionNames,
    });

  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});





















// app.post("/createfile", async (req, res) => {
//   const { file_name, file_subject,file_id,originator,file_recipient,date,inwardnum,outwardnum, current_status,remarks } = req.body;

//   try {
    
//       const insertQuery =
//         " INSERT INTO files (file_id, file_name, file_subject, sender, receiver, date_added, inwardnum,outwardnum,current_status, remarks,department)     VALUES (?,?,?,?,?,?,?,?,?,?,?)";
//       db.query(
//         insertQuery,
//         [file_id,file_name,file_subject,originator,file_recipient,date,inwardnum,outwardnum,current_status,remarks,''],
//         (err, result) => {
//           if (err) {
//             console.error("Insert error:", err);
//             return res.status(500).json({ error: "Failed to create file" });
//           }
//           return res.status(201).json({ message: "File created successfully!" });
//         }
//       );
//     }
//   catch (error) {
//     console.error("Unexpected error:", error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });



app.post("/createfilewithattachments", upload.array("file", 10), (req, res) => {
  const {
    file_id,
    file_name,
    file_subject,
    sender,
    receiver,
    // date_added,
    inwardnum,
    outwardnum,
    current_status,
    remarks,
    status,
    department,
    division,
    unit,
    file_no
  } = req.body;

  const date_added = new Date();
  // const expiry_date = new Date(date_added.getTime() + 48 * 60 * 60 * 1000); // +48 hours
  const expiry_date = new Date(date_added.getTime() + 3 * 60 * 1000); // +48 hours

  const attachments = req.files;

  if (!file_id || !attachments) {
    return res.status(400).json({ error: "Missing required fields or attachments" });
  }

  // Insert into files table
  const insertFileQuery = `
    INSERT INTO files (
      file_id, file_subject, receiver, date_added,
      current_status, remarks, status,department,division,unit,file_no, receivedAt,
    expiry)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?)
  `;

  const fileValues = [
    file_id,
    // file_name,
    file_subject,
    // sender,
    receiver,
    // date_added,
    new Date(),
    // inwardnum,
    // outwardnum,
    current_status,
    remarks,
    status,
    department,
    division,
    unit,file_no,new Date().toISOString(),0
    
  ];

  db.query(insertFileQuery, fileValues, (fileErr, fileResult) => {
    if (fileErr) {
      console.error("File insert error:", fileErr);
      return res.status(500).json({ error: "Failed to create file" });
    }

    // Insert each attachment with the same file_id
    if (attachments && attachments.length > 0) {
    const insertAttachmentsQuery = `
      INSERT INTO attachments (file_id, path, filename)
      VALUES ?
    `;

    const attachmentValues = attachments.map((file) => [
      // file_id,
      // file?.id,
      fileResult.insertId,
      // file.originalname,
      file.path,
      file.originalname
      // file.size,
    ]);

    db.query(insertAttachmentsQuery, [attachmentValues], (attErr, attResult) => {
      if (attErr) {
        console.error("Attachment insert error:", attErr);
        return res.status(500).json({ error: "File saved, but failed to save attachments" });
      }

      res.status(201).json({
        message: "File and attachments uploaded successfully",
        file_id,
        attachment_count: attachments.length,
        id: fileResult.insertId
      });
    });
  }else{
    return res.status(201).json({ 
      message: "File created without attachments.", 
      attachment_count: attachments.length,
      id: fileResult.insertId
    });
  }
  });
});


app.put("/createfilewithattachments/:id", upload.array("file", 10), (req, res) => {
  const fileId = req.params.id;

  const {
    file_name,
    file_subject,
    // sender,
    receiver,
    // date_added,
    // inwardnum,
    // outwardnum,
    current_status,
    remarks,
    department,
    division,
    unit,
    status
  } = req.body;

  // const updatedDate = new Date(date_added)

  const attachments = req.files;

  // ✅ Basic validation
  if (!receiver) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // ✅ Update the file metadata
  const updateFileQuery = `
    UPDATE files
    SET 
       
      file_subject = ?,
      receiver = ?, 
      date_added = ?, 
      current_status = ?, 
      remarks = ?,
      department = ?,
      division = ?,
      unit = ?,
      status = ?
    WHERE id = ?
  `;

  const updateFileValues = [
    // file_name,
    file_subject,
    receiver,
    // updatedDate,
    // date_added,
    new Date(),
    // inwardnum,
    // outwardnum,
    current_status,
    remarks,
    department,
    division,
    unit,
    status,
    fileId
  ];

  db.query(updateFileQuery, updateFileValues, (fileErr, fileResult) => {
    if (fileErr) {
      console.error("File update error:", fileErr);
      return res.status(500).json({ error: "Failed to update file" });
    }

    // ✅ If no attachments, just return success
    if (!attachments || attachments.length === 0) {
      return res.status(200).json({
        message: "File updated successfully (no new attachments)",
        file_id: fileId
      });
    }

    // 🔁 Optional: Delete old attachments before inserting new ones
    // const deleteOldAttachmentsQuery = `DELETE FROM attachments WHERE file_id = ?`;

    // db.query(deleteOldAttachmentsQuery, [fileId], (delErr) => {
    //   if (delErr) {
    //     console.error("Error deleting old attachments:", delErr);
    //     return res.status(500).json({ error: "Failed to delete old attachments" });
    //   }

    //   // ✅ Insert new attachments
      const insertAttachmentsQuery = `
        INSERT INTO attachments (file_id, path, filename)
        VALUES ?
      `;

      const attachmentValues = attachments.map((file) => [
        fileId,
        file.path,
        file.originalname
      ]);

      db.query(insertAttachmentsQuery, [attachmentValues], (attErr, attResult) => {
        if (attErr) {
          console.error("Attachment insert error:", attErr);
          return res.status(500).json({ error: "File updated, but failed to save new attachments" });
        }

        return res.status(200).json({
          message: "File and attachments updated successfully",
          file_id: fileId,
          attachment_count: attachments.length
        });
      });
    // });
  });
});



//new
// app.get("/api/files", (req, res) => {
//   console.log("API /api/files called with query:", req.query);
  
//   const statusParam = req.query.status;
//   const departmentId = req.query.department;
//   const division = req.query.division;
//   const unit = req.query.unit;

//   const isGSO = departmentId && departmentId.toUpperCase() === 'OGS';

//   if (statusParam) {
//     // Handle status filtering
//     const statuses = statusParam.split(',').map(s => s.trim().toLowerCase());
//     const allowedStatuses = ['pending', 'approved', 'rejected', 'completed', 'failed'];
//     const filteredStatuses = statuses.filter(s => allowedStatuses.includes(s));

//     if (filteredStatuses.length === 0) {
//       return res.status(400).json({ error: "No valid status values provided" });
//     }

//     const placeholders = filteredStatuses.map(() => '?').join(', ');
//     let query = `SELECT * FROM files WHERE LOWER(status) IN (${placeholders})`;
    
//     const values = [...filteredStatuses];
   
//     // if (!isGSO) {
//     //   query += ` AND department = ?`;
//     //   values.push(departmentId);
//     // }
//     if (departmentId && departmentId.toUpperCase() !== 'OGS') {
//       query += ` AND department = ?`;
//       values.push(departmentId);
      
//    }

//     if (division) {
//       query += ` AND division = ?`;
//       values.push(division);
//     }

//     if (unit) {
//       query += ` AND unit = ?`;
//       values.push(unit);
//     }

//     query += ` AND status IS NOT NULL ORDER BY date_added DESC`;

    

//     console.log('Filtered Query:', query);
//     console.log('Query Values:', values);

//     db.query(query, values, (err, results) => {
//       if (err) {
//         console.error("Database error:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
//       res.json(results);
//     });

//   } else {
//     // No status filtering
//     let query = `SELECT * FROM files`;
//     const values = [];

//     const conditions = []

//     if (!isGSO) {
//       conditions.push(`department = ?`);
//       values.push(departmentId);
     
//     }

//     if (division) {
//       conditions.push(`division = ?`);
//       values.push(division);
//     }

//      if (unit) {
//       conditions.push(`unit = ?`);
//       values.push(unit);
//     }

//      if (conditions.length > 0) {
//       query += ` WHERE ` + conditions.join(' AND ');
//     }


//     query += ` ORDER BY date_added DESC`;

//     console.log("Query for all files:", query);
//     console.log("Values==:", values);

//     db.query(query, values, (err, results) => {
//       if (err) {
//         console.error("Error fetching files:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
//       res.json(results);
//     });
//   }
// });
app.get("/api/files", (req, res) => {
  console.log("API /api/files called with query:", req.query);
  
  const statusParam = req.query.status;
  const departmentId = req.query.department; // logged-in department
  const division = req.query.division;
  const unit = req.query.unit;

  const isGSO = departmentId && departmentId.toUpperCase() === "OGS";

  // ✅ Helper to run final query
  const executeQuery = (query, values) => {
    console.log("Final Query:", query);
    console.log("Values:", values);
    db.query(query, values, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  };

  // ✅ STATUS FILTER CASE
  if (statusParam) {
    const statuses = statusParam.split(",").map(s => s.trim().toLowerCase());
    const allowedStatuses = ['pending', 'approved', 'rejected', 'completed', 'failed'];
    const filteredStatuses = statuses.filter(s => allowedStatuses.includes(s));

    if (filteredStatuses.length === 0) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    let query = `SELECT * FROM files WHERE LOWER(status) IN (${filteredStatuses.map(() => '?').join(', ')})`;
    const values = [...filteredStatuses];

    // ✅ Show created OR addressed files (except GSO)
    if (!isGSO) {
      query += ` AND (department = ? OR receiver = ?)`;
      values.push(departmentId, departmentId);
    }

    if (division) {
      query += ` AND division = ?`;
      values.push(division);
    }

    if (unit) {
      query += ` AND unit = ?`;
      values.push(unit);
    }

    query += ` ORDER BY date_added DESC`;
    return executeQuery(query, values);
  }

  // ✅ NO STATUS FILTER CASE
  let query = `SELECT * FROM files`;
  const conditions = [];
  const values = [];

  if (!isGSO) {
    conditions.push(`(department = ? OR receiver = ?)`);
    values.push(departmentId, departmentId);
  }

  if (division) {
    conditions.push(`division = ?`);
    values.push(division);
  }

  if (unit) {
    conditions.push(`unit = ?`);
    values.push(unit);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY date_added DESC`;
  return executeQuery(query, values);
});




app.put("/api/files/:id/read", (req, res) => {
  const { id } = req.params;

  const query = `UPDATE files SET is_read = TRUE WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "File marked as read" });
  });
});






// API: Fetch all files
// app.get("/api/files",  (req, res) => {
//   console.log("API /api/files called with query:", req.query);
//   const query = "SELECT * FROM files ORDER BY date_added DESC";
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching files:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.json(results);
//   });
// });

// app.get("/api/files", (req, res) => {
//    console.log("API /api/files called with query===:", req.query);
//   const statusParam = req.query.status;
//    const departmentId = req.query.department; 

//    const isGSO = departmentId && departmentId.toUpperCase() === 'GSO';

//   //   if (!departmentId) {
//   //   return res.status(400).json({ error: "Missing department ID" });
//   // }

//   if (statusParam) {
//     // If status param is provided, filter based on it
//     const statuses = statusParam.split(',').map(s => s.trim().toLowerCase());

//     const allowedStatuses = ['pending', 'approved', 'rejected', 'completed', 'failed'];
//     const filteredStatuses = statuses.filter(s => allowedStatuses.includes(s));

//     if (filteredStatuses.length === 0) {
//       return res.status(400).json({ error: "No valid status values provided" });
//     }

//     const placeholders = filteredStatuses.map(() => '?').join(', ');
//     const query = `SELECT * FROM files WHERE LOWER(status) IN (${placeholders}) AND department = ? AND status IS NOT NULL ORDER BY date_added DESC`;

//     console.log('Filtered Query:', query);
//     console.log('filteredStatuses:', filteredStatuses);

//      const values = [...filteredStatuses, departmentId];

//     db.query(query, values, (err, results) => {
//       if (err) {
//         console.error("Database error:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
//       res.json(results);
//     });

//   } else {
//     // If no status param, return all files
//     const query = "SELECT * FROM files WHERE department = ? ORDER BY date_added DESC";

//     console.log("Fetching all files");
//     db.query(query, departmentId, (err, results) => {
//       if (err) {
//         console.error("Error fetching files:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
//       console.log('results===',results)
//       res.json(results);
//     });
//   }
// });



app.get("/api/files/today", (req, res) => {
  const department = req.query.department;

  if (!department) {
    return res.status(400).json({ error: "Missing department" });
  }

  // Use an inclusive start and exclusive end range for "today" to avoid timezone
  // ambiguities with DATE(date_added) = CURDATE() and preserve index usage.
  const query = `
    SELECT *
    FROM files
    WHERE date_added >= CURDATE()
      AND date_added < (CURDATE() + INTERVAL 1 DAY)
      AND receiver = ?
    ORDER BY date_added DESC
  `;

  db.query(query, [department], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (Array.isArray(results) && results.length > 0) {
      return res.json(results);
    }

    // Fallback: some environments store date_added in a way that range misses records.
    // Try DATE(date_added) = CURDATE() with department as a secondary attempt.
    const fallbackQuery = `
      SELECT *
      FROM files
      WHERE DATE(date_added) = CURDATE()
        AND receiver = ?
      ORDER BY date_added DESC
    `;
    db.query(fallbackQuery, [department], (fbErr, fbResults) => {
      if (fbErr) {
        console.error("Database error (fallback):", fbErr);
        return res.status(500).json({ error: "Database error" });
      }
      return res.json(fbResults || []);
    });
  });
});


// app.get("/api/files", (req, res) => {
//   console.log("API /api/files called with query stat:", req.query);
//   const statusParam = req.query.status;
//   console.log('stat',statusParam)

//   if (!statusParam) {
//     return res.status(400).json({ error: "Missing 'status' query parameter" });
//   }

//   // Convert to array (even if only one status is given)
//   const statuses = statusParam.split(',').map(s => s.trim().toLowerCase());

//   // Optional: Validate against allowed values
//   const allowedStatuses = ['pending', 'approved', 'completed', 'failed'];
//   const filteredStatuses = statuses.filter(s => allowedStatuses.includes(s));

//   if (filteredStatuses.length === 0) {
//     return res.status(400).json({ error: "No valid status values provided" });
//   }

//   // Create SQL placeholders (?, ?, ?)
//   const placeholders = filteredStatuses.map(() => '?').join(', ');
//   const query = `SELECT * FROM files WHERE status IN (${placeholders}) AND status IS NOT NULL`;

//   console.log('filteredStatuses',filteredStatuses)

//   db.query(query, filteredStatuses, (err, results) => {
//     if (err) {
//       console.error("Database error:", err);
//       return res.status(500).json({ error: "Database error" });
//     }

//     res.json(results);
//   });
// });




// DELETE file by ID
app.delete("/api/files/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM files WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({ message: "File deleted successfully" });
  });
});


// GET comments for a specific document
app.get('/api/documents/:documentId/comments', (req, res) => {
  const documentId = req.params.documentId;

  // const query = `SELECT * FROM comments WHERE file_id = ? ORDER BY created_at ASC`;
  const query = `SELECT c.*, u.username AS username FROM comments c JOIN signup u ON c.user_id = u.id WHERE c.file_id = ? ORDER BY c.created_at DESC;`;
  
 
  db.query(query, [documentId], (err, comments) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // res.status(200).json(rows);
     if (comments.length === 0) return res.status(200).json([]);

    const commentIds = comments.map(c => c.id);

    const attachmentQuery = `
      SELECT * FROM attachments
      WHERE comment_id IN (?);
    `;
    db.query(attachmentQuery, [commentIds], (err, attachments) => {
      if (err) {
        console.error('DB Error (attachments):', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Map attachments to their comments
      const attachmentsByComment = {};
      attachments.forEach(a => {
        if (!attachmentsByComment[a.comment_id]) {
          attachmentsByComment[a.comment_id] = [];
        }
        attachmentsByComment[a.comment_id].push(a);
      });

      // Attach attachments to each comment
      const result = comments.map(comment => ({
        ...comment,
        attachments: attachmentsByComment[comment.id] || []
      }));

      res.status(200).json(result);
    });





  });
});



app.get('/api/attachments', async (req, res) => {
  const { file_id } = req.query;
  console.log('Received file_id:', file_id);

  if (!file_id) {
    return res.status(400).json({ error: 'file_id is required' });
  }

  try {
    const [attachments] = await dbPromise.query(
      'SELECT path, filename, id FROM attachments WHERE file_id = ?',
      [file_id]
    );

    console.log('Attachments fetched:', attachments);

    res.json(attachments);
  } catch (err) {
    console.error('Error fetching attachments:', err);
    console.error('Error fetching attachments:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.delete('/api/attachments/:id', async (req, res) => {
  const attachmentId = req.params.id;

  try {
    const [result] = await db.promise().query(
      'DELETE FROM attachments WHERE id = ?',
      [attachmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    res.status(200).json({ message: 'Attachment deleted' });
  } catch (err) {
    console.error('Error deleting attachment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.put('/api/files/:id', async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;

  await db.query(`
    UPDATE files SET title = ?, description = ? WHERE id = ?
  `, [title, description, id]);

  res.json({ id, title, description });
});


// app.get('/api/departments', (req, res) => {
//   const departments = [
//     { id: 1, name: 'Finance', code: 'FIN' },
//     { id: 2, name: 'Human Resource', code: 'HR' },
//     { id: 3, name: 'Operations', code: 'OPN' },
//     { id: 4, name: 'Marketing', code: 'MKT' },
//   {id: 5, name: 'Santhigri Healthcare and Research Organisation', code: 'SHRO'}
//   ];

//   res.json(departments);
// });
// GET /departments
app.get('/api/departments', async (req, res) => {
  try {
    const [rows] = await dbPromise.query('SELECT * FROM departments');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/api/departments/:departmentId/divisions', async (req, res) => {
  const { departmentId } = req.params; 
  console.log('departId===',departmentId)

  try {
    const [rows] = await dbPromise.query(
      'SELECT id, name, code FROM divisions WHERE department_id = ?', 
      [departmentId]
    );
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching divisions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/api/divisions/:divisionId/units', async (req, res) => {
  const { divisionId } = req.params;
  console.log('divisionId ===', divisionId);

  try {
    const [rows] = await dbPromise.query(
      'SELECT id, name, code FROM units WHERE division_id = ?',
      [divisionId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// app.get('/api/divisions/:deptCode', (req, res) => {
//   const deptCode = req.params.deptCode;

//   const divisionData = {
//     FIN: [
//     { name: 'Accounts', code: 'ACC' },
//     { name: 'Audit', code: 'AUD' }
//   ],
//   HR: [
//     { name: 'Recruitment', code: 'REC' },
//     { name: 'Training', code: 'TRN' }
//   ],
//   OPN: [
//     { name: 'Support', code: 'SUP' },
//     { name: 'Development', code: 'DEV' }
//   ],
//   MKT: [
//     { name: 'Advertising', code: 'ADV' },
//     { name: 'Branding', code: 'BRD' }
//   ]
//   };

//   res.json(divisionData[deptCode] || []);
// });


// app.get('/api/units/:divisionCode', (req, res) => {
//   const divisionCode = req.params.divisionCode;

//   const unitsData = {  
//     ADV: [
//     { name: 'Unitone', code: 'UNITONE' },
//     { name: 'Unittwo', code: 'UNITTWO' }
//   ],
//   BRD: [
//     { name: 'Santhigiri Ayurveda Siddha Vaidyasala', code: 'SASV' },
   
//   ],
//   DEV: [
//     { name: 'Production', code: 'PRD' },
//     { name: 'Quality Assurance', code: 'QA' }   
//   ]
//   };

//   res.json(unitsData[divisionCode] || []);
// });

//file events
app.post('/api/file-events', async (req, res) => {
  const {
    event_type,
    file_id,
    user_id,
    origin,
    forwarded_to,
    approved_by,
    viewed_by,
    edited_by,
    commented_by
  } = req.body;

  if (!event_type || !file_id) {
    return res.status(400).json({ error: 'event_type and file_id are required' });
  }

  try {
    const [result] = await dbPromise.query(
      `INSERT INTO file_events (event_type, created_at, file_id, user_id, origin, forwarded_to, approved_by,viewed_by,edited_by, commented_by)
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?,?, ?)`,
      [event_type, file_id, user_id, origin, forwarded_to, approved_by, viewed_by, edited_by, commented_by]
    );

    res.status(201).json({
      message: 'File event logged successfully',
      event_id: result.insertId
    });
  } catch (err) {
    console.error('Error inserting file event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get("/api/file-events/:fileId", (req, res) => {
  const fileId = req.params.fileId;
  console.log('fileId===',fileId)

  if (!fileId) {
    return res.status(400).json({ error: "Missing fileId" });
  }

  // const query = `SELECT * FROM file_events WHERE file_id = ? ORDER BY created_at DESC`;
  const query = `SELECT 
      file_events.*, 
      signup.username 
    FROM 
      file_events 
    JOIN 
      signup 
    ON 
      file_events.user_id = signup.id 
    WHERE 
      file_events.file_id = ? 
    ORDER BY 
      file_events.created_at DESC`

  db.query(query, [fileId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    res.json(results);
  });
});



// app.get('/api/view-file/:fileId', (req, res) => {
//   const fileId = req.params.fileId;
//   const userId = req.user?.id; // assuming user is authenticated via middleware

//   // 1. Log the view in file_events
//   const insertQuery = `
//     INSERT INTO file_events (file_id, user_id, event_type, created_at)
//     VALUES (?, ?, 'viewed', NOW())
//   `;

//   db.query(insertQuery, [fileId, userId], (err) => {
//     if (err) {
//       console.error('Error logging view:', err);
//       // Don't block file view due to logging error
//     }

//     // 2. Serve the file or data
//     // You could return file data, metadata, or redirect to a frontend file viewer
//     res.json({ message: 'File viewed and logged' });
//   });
// });







const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'file_register_db'
});

const dbPromise1 = pool.promise();



async function generateFileNumber() {
  const connection = await dbPromise1.getConnection();

  try {
    await connection.beginTransaction();

    // Increment the counter atomically
    await connection.query(`
      UPDATE file_counter
      SET count = count + 1
      WHERE department = 'GLOBAL'
    `);

    // Get the updated count
    const [rows] = await connection.query(`
      SELECT count FROM file_counter WHERE department = 'GLOBAL'
    `);

    const newCount = rows[0].count;

    // Format the number as 2 digits (01, 02, 03, ...)
    const formattedNumber = String(newCount).padStart(2, '0');

    await connection.commit();
    return formattedNumber;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// Function to get current file number without incrementing
async function getCurrentFileNumber() {
  const connection = await dbPromise1.getConnection();

  try {
    const [rows] = await connection.query(`
      SELECT count FROM file_counter WHERE department = 'GLOBAL'
    `);

    if (rows.length === 0) {
      // If no record exists, create one
      await connection.query(`
        INSERT INTO file_counter (department, count) VALUES ('GLOBAL', 0)
      `);
      return '01';
    }

    const currentCount = rows[0].count;
    const nextNumber = currentCount + 1;
    const formattedNumber = String(nextNumber).padStart(2, '0');
    
    return formattedNumber;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
}

// (async () => {
//   try {
//     const newNumber = await generateFileNumber();
//     console.log('Generated File Number:', newNumber);
//   } catch (error) {
//     console.error('Error generating file number:', error);
//   }
// })();
// API endpoint - generates file number immediately (for backward compatibility)
app.get("/api/file-number", async (req, res) => {
  try {
    const fileNumber = await generateFileNumber();
    res.json({ fileNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate file number" });
  }
});

// New API endpoint - generates file number only when actually needed
app.post("/api/generate-file-number", async (req, res) => {
  try {
    const fileNumber = await generateFileNumber();
    res.json({ fileNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate file number" });
  }
});

// API endpoint - shows next file number without incrementing (for preview)
app.get("/api/next-file-number", async (req, res) => {
  try {
    const fileNumber = await getCurrentFileNumber();
    console.log('Preview file number:', fileNumber);
    res.json({ fileNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get next file number" });
  }
});

// Debug endpoint to check current counter value
app.get("/api/debug-counter", async (req, res) => {
  try {
    const connection = await dbPromise1.getConnection();
    const [rows] = await connection.query(`
      SELECT count FROM file_counter WHERE department = 'GLOBAL'
    `);
    connection.release();
    
    const currentCount = rows.length > 0 ? rows[0].count : 'No record found';
    console.log('Current counter value:', currentCount);
    res.json({ currentCount, nextNumber: currentCount + 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get counter value" });
  }
});



app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await dbPromise.query("SELECT * FROM signup ORDER BY id ASC");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});



app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    // const [checkUser] = await db.execute("SELECT * FROM signup WHERE id = ?", [id]);
    // if (checkUser.length === 0) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // Delete user
    await dbPromise.query("DELETE FROM signup WHERE id = ?", [id]);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});


app.get("/api/roles", async (req, res) => {
  const [roles] = await dbPromise.query("SELECT * FROM roles");
  const [permissions] = await dbPromise.query("SELECT * FROM permissions");

  const [rolePerms] = await dbPromise.query(`
    SELECT role_id, permission_id
    FROM role_permissions
  `);

  const result = roles.map(role => ({
    ...role,
    permissions: permissions.map(p => ({
      ...p,
      assigned: rolePerms.some(rp => rp.role_id === role.id && rp.permission_id === p.id)
    }))
  }));

  res.json(result);
});


app.post("/api/roles/:id/permissions", async (req, res) => {
  const roleId = req.params.id;
  const { permissionIds } = req.body; // e.g. [1, 2, 3]

  // Delete existing
  await dbPromise.query("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);

  // Insert new
  if (permissionIds.length) {
    const values = permissionIds.map(pid => [roleId, pid]);
    await dbPromise.query("INSERT INTO role_permissions (role_id, permission_id) VALUES ?", [values]);
  }

  res.json({ message: "Role permissions updated successfully!" });
});



app.put("/api/files/:id/expire", async (req, res) => {
  const { id } = req.params;
  try {
    await dbPromise.query(
      // `UPDATE files SET status = 'expired' WHERE id = ?`,
     `UPDATE files SET expiry = 1, status = 'expired' WHERE id = ?`,
      [id]
    );
    res.json({ message: "File marked as expired" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error marking file expired" });
  }
});




app.get("/api/files/redlist", async (req, res) => {
  const [rows] = await db.promise().query(`
    SELECT * FROM files WHERE expiry = 1 ORDER BY date_added DESC
  `);
  res.json(rows);
});


app.post('/api/notes', async (req, res) => {
  const { note, userId, fileId} = req.body;
  if (!fileId || !userId || !note) {
    return res.status(400).json({ error: 'File number, user, and note are required' });
  }
  const createdAt = new Date(); // current date & time
  await dbPromise.query(
    'INSERT INTO notes (note, created_by,file_id, created_at) VALUES (?, ?, ?, ?)',
    [note, userId,fileId,createdAt]
  );
  res.status(201).send({ message: 'Note created' });
});



app.get('/api/documents/:id/notes', async (req, res) => {
  const { id } = req.params;
  

  const [notes] = await dbPromise.query(`
    SELECT n.note, n.created_at, u.username
FROM notes n
JOIN signup u ON n.created_by = u.id
WHERE n.file_id = ?
ORDER BY n.created_at DESC;
  `, [id]);
  res.json(notes);
});





// Bulk delete API
app.post("/api/files/bulk-delete", async (req, res) => {
  const { fileIds } = req.body; // Expecting an array of IDs

  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).json({ message: "No file IDs provided" });
  }

  try {
    const placeholders = fileIds.map(() => "?").join(","); // ?,?,?
    const [result] = await dbPromise.query(
      `DELETE FROM files WHERE id IN (${placeholders})`,
      fileIds
    );

    res.json({ message: `${result.affectedRows} file(s) deleted successfully` });
  } catch (err) {
    console.error("Error deleting files:", err);
    res.status(500).json({ message: "Error deleting files" });
  }
});


app.use((req, res, next) => {
  console.log("Unknown route:", req.method, req.url);
  res.status(404).send("Not Found");
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});