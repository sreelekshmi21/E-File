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
//app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


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
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // save files in uploads folder
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); // unique filename
//   }
// });

// const upload = multer({ storage: storage });

// STORAGE ENGINE: Create folder dynamically per file
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const fileName = req.body.fileName;   // folder name
//     const uploadPath = path.join("uploads", fileName);

//     // create folder if not exists
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }

//     cb(null, uploadPath);
//   },

//   filename: function (req, file, cb) {
//     cb(null, file.originalname); // keep original name
//   }
// });

// const upload = multer({ storage });


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("req.body in route:", req.body);
    const folderName = req.body.fileName  // folder name from form
    if (!folderName) {
      console.log("❌ ERROR: file_id not received in Multer");
    }
    const safeFolderName = folderName.replace(/\//g, "-");
    const folderPath = path.join(__dirname, "uploads", safeFolderName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });




const storageStep2 = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("STEP 2 => req.body:", req.body);

    const fileName = req.body.fileName;
    const department = req.body.department;

    if (!fileName || !department) {
      return cb(new Error("fileName and department are required"), null);
    }

    const safeFileName = fileName.replace(/[\/\\]/g, "-");
    // const safeDepartment = department.replace(/[\/\\]/g, "-");

    // Folder: uploads/<fileName>/<department>
    const folderPath = path.join(
      __dirname,
      "uploads",
      safeFileName,
      department
    );

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const uploadStep2 = multer({ storage: storageStep2 });





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
// app.post('/upload', upload.array('file', 10), async (req, res) => {
//   try {

//     // const file_id = req.body.file_id;

//     // if (!file_id) {
//     //   return res.status(400).json({ error: 'file_id is required' });
//     // }

//     const files = req.files.map(file => ({
//       filename: file.originalname,
//       path: file.path,
//       size: file.size,
//       url: `http://localhost:5000/uploads/${file.filename}`
//     }));

//      const insertQuery = 'INSERT INTO attachments (path) VALUES ?';
//      const values = files.map(file => [file.path]);

//       db.query(insertQuery, [values], (err, result) => {
//     if (err) {
//       console.error('DB insert error:', err);
//       return res.status(500).json({ error: 'Failed to insert file paths' });
//     }

//     res.status(200).json({
//       message: 'Files uploaded and paths saved to database',
//       fileCount: result.affectedRows,
//       paths: values.flat()
//     });
//   });


// //      const sql = `
// //      INSERT INTO files (
// //      file_id,
// //   file_name,
// //   file_subject,
// //   sender,
// //   receiver,
// //   date_added,
// //   inwardnum,
// //   outwardnum,
// //   current_status,
// //   remarks,
// //   department,
// //   path,
// //   size,
// //   url
// // ) VALUES ?
// //     `;
// //    // Format values for bulk insert
// //     // const values = files.map(f => [f.size, f.path, f.url]);
// //     const values = files.map(f => [
// //       f.file_id,
// //   f.file_name,
// //   f.file_subject,
// //   f.sender,
// //   f.receiver,
// //   f.date_added,     // 'YYYY-MM-DD' or new Date()
// //   f.inwardnum,
// //   f.outwardnum,
// //   f.current_status,
// //   f.remarks,
// //   f.department,
// //   f.path,
// //   f.size,
// //   f.url
// // ]);

// //     try {
// //   const [result] = await db.promise().query(sql, [values]);
// //   console.log('Insert successful:', result);
// // } catch (err) {
// //   console.error('Insert failed:', err);
// // }



//     // await File.insertMany(files);
//     // res.status(200).json({ message: 'Files uploaded successfully', files: files });
//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).json({ error: 'Error uploading files', details: error.message});
//   }
// });
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
  const { username, password, email, department, role_id } = req.body;

  if (!username || !password || !role_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }
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
        "INSERT INTO signup (username, passwd, email, department, role_id) VALUES (?, ?, ?, ?, ?)";
      db.query(
        insertQuery,
        [username, password, email, department, role_id],
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
      { expiresIn: '24h' }
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



// app.post("/createfilewithattachments", upload.array("file", 10), (req, res) => {
//   const {
//     file_id,
//     file_name,
//     file_subject,
//     sender,
//     receiver,
//     // date_added,
//     inwardnum,
//     outwardnum,
//     current_status,
//     remarks,
//     status,
//     department,
//     division,
//     unit,
//     file_no
//   } = req.body;

//   const date_added = new Date();
//   // const expiry_date = new Date(date_added.getTime() + 48 * 60 * 60 * 1000); // +48 hours
//   const expiry_date = new Date(date_added.getTime() + 3 * 60 * 1000); // +48 hours

//   const attachments = req.files;

//   if (!file_id || !attachments) {
//     return res.status(400).json({ error: "Missing required fields or attachments" });
//   }

//   // Insert into files table
//   const insertFileQuery = `
//     INSERT INTO files (
//       file_id, file_subject, receiver, date_added,
//       current_status, remarks, status,department,division,unit,file_no, receivedAt,
//     expiry, sender)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)
//   `;

//   const fileValues = [
//     file_id,
//     // file_name,
//     file_subject,
//     // sender,
//     receiver,
//     // date_added,
//     new Date(),
//     // inwardnum,
//     // outwardnum,
//     current_status,
//     remarks,
//     status,
//     department,
//     division,
//     unit,file_no,new Date().toISOString(),0, sender

//   ];

//   db.query(insertFileQuery, fileValues, (fileErr, fileResult) => {
//     if (fileErr) {
//       console.error("File insert error:", fileErr);
//       return res.status(500).json({ error: "Failed to create file" });
//     }

//     // Insert each attachment with the same file_id
//     if (attachments && attachments.length > 0) {
//     const insertAttachmentsQuery = `
//       INSERT INTO attachments (file_id, path, filename)
//       VALUES ?
//     `;

//     const attachmentValues = attachments.map((file) => [
//       // file_id,
//       // file?.id,
//       fileResult.insertId,
//       // file.originalname,
//       file.path,
//       file.originalname
//       // file.size,
//     ]);

//     db.query(insertAttachmentsQuery, [attachmentValues], (attErr, attResult) => {
//       if (attErr) {
//         console.error("Attachment insert error:", attErr);
//         return res.status(500).json({ error: "File saved, but failed to save attachments" });
//       }

//       res.status(201).json({
//         message: "File and attachments uploaded successfully",
//         file_id,
//         attachment_count: attachments.length,
//         id: fileResult.insertId
//       });
//     });
//   }else{
//     return res.status(201).json({ 
//       message: "File created without attachments.", 
//       attachment_count: attachments.length,
//       id: fileResult.insertId
//     });
//   }
//   });
// });
///////////////////////////////////////////////////////////////
// app.post("/createfilewithattachments", upload.array("file", 10), (req, res) => {
//   const {
//     file_id,
//     fileName,
//     file_subject,
//     sender,
//     receiver,
//     inwardnum,
//     outwardnum,
//     current_status,
//     remarks,
//     status,
//     department,
//     division,
//     unit,
//     file_no
//   } = req.body;

//   const date_added = new Date();
//   const expiry_date = new Date(date_added.getTime() + 3 * 60 * 1000); // 3 minutes

//   const attachments = req.files;

//   console.log('=====================',file_id,fileName)

//   if (!file_id || !fileName) {
//     return res.status(400).json({ error: "Missing file_id or file_name" });
//   }

//   // ✅ Create folder name from file_name (remove extension)
//   const folderName = fileName; // "10th_marksheet"
//   const folderPath = path.join(__dirname, "uploads", folderName);

//   // ✅ Create folder if it does not exist
//   if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath, { recursive: true });
//   }

//   // Insert into files table
//   const insertFileQuery = `
//     INSERT INTO files (
//       file_id, file_subject, receiver, date_added,
//       current_status, remarks, status, department, division, unit, file_no, receivedAt,
//       expiry, sender
//     )
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   const fileValues = [
//     file_id,
//     file_subject,
//     receiver,
//     new Date(),
//     current_status,
//     remarks,
//     status,
//     department,
//     division,
//     unit,
//     file_no,
//     new Date().toISOString(),
//     expiry_date,
//     sender
//   ];

//   db.query(insertFileQuery, fileValues, (fileErr, fileResult) => {
//     if (fileErr) {
//       console.error("File insert error:", fileErr);
//       return res.status(500).json({ error: "Failed to create file" });
//     }

//     // Process attachments
//     if (attachments && attachments.length > 0) {
//       const movedFiles = [];

//       attachments.forEach((file) => {
//         const newPath = path.join(folderPath, file.originalname);
//         fs.renameSync(file.path, newPath);

//         movedFiles.push([fileResult.insertId, `uploads/${folderName}/${file.originalname}`, file.originalname]);
//       });   

//       // Insert into attachments table
//       const insertAttachmentsQuery = `
//         INSERT INTO attachments (file_id, path, filename)
//         VALUES ?
//       `;

//       db.query(insertAttachmentsQuery, [movedFiles], (attErr) => {
//         if (attErr) {
//           console.error("Attachment insert error:", attErr);
//           return res.status(500).json({ error: "File saved, but failed to save attachments" });
//         }

//         res.status(201).json({
//           message: "File and attachments uploaded successfully",
//           file_id,
//           attachment_count: attachments.length,
//           id: fileResult.insertId
//         });
//       });

//     } else {
//       return res.status(201).json({
//         message: "File created without attachments.",
//         attachment_count: 0,
//         id: fileResult.insertId
//       });
//     }
//   });
// });
/////////////////////////////////////////////////////
app.post(
  "/createfilewithattachments",
  upload.array("file", 10),
  (req, res) => {
    const {
      file_id,
      fileName,
      file_subject,
      current_status,
      remarks,
      department,
      division,
      unit,
      file_no,
      sender
    } = req.body;

    const date_added = new Date();
    const expiry_date = new Date(date_added.getTime() + 3 * 60 * 1000);

    const attachments = req.files;

    if (!file_id || !fileName || !file_subject) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    // Convert OGS/SM/OGS/44/2025 → OGS-SM-OGS-44-2025
    const safeFolderName = fileName.replace(/\//g, "-");
    const folderPath = path.join(__dirname, "uploads", safeFolderName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    /* ==========================
       INSERT FILE (DRAFT)
    ========================== */
    const insertFileQuery = `
      INSERT INTO files (
        file_id,
        file_subject,
        date_added,
        current_status,
        remarks,
        status,
        department,
        division,
        unit,
        file_no,
        receivedAt,
        expiry,
        sender
      )
      VALUES (?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?, ?, ?, ?)
    `;

    const fileValues = [
      file_id,
      file_subject,
      date_added,
      current_status,
      remarks || "",
      department,
      division,
      unit,
      file_no,
      new Date().toISOString(),
      expiry_date,
      sender
    ];

    db.query(insertFileQuery, fileValues, (fileErr, fileResult) => {
      if (fileErr) {
        console.error("File insert error:", fileErr);
        return res.status(500).json({
          error: "Failed to create file"
        });
      }

      /* ==========================
         ATTACHMENTS
      ========================== */
      if (attachments && attachments.length > 0) {
        const movedFiles = [];

        attachments.forEach((file) => {
          const newPath = path.join(folderPath, file.originalname);
          fs.renameSync(file.path, newPath);

          movedFiles.push([
            fileResult.insertId,
            `uploads/${safeFolderName}/${file.originalname}`,
            file.originalname
          ]);
        });

        const insertAttachmentsQuery = `
          INSERT INTO attachments (file_id, path, filename)
          VALUES ?
        `;

        db.query(
          insertAttachmentsQuery,
          [movedFiles],
          (attErr) => {
            if (attErr) {
              console.error("Attachment insert error:", attErr);
              return res.status(500).json({
                error:
                  "File created but failed to save attachments"
              });
            }

            return res.status(201).json({
              message: "File created in draft mode",
              id: fileResult.insertId,
              attachment_count: attachments.length,
              folder_used: safeFolderName
            });
          }
        );
      } else {
        return res.status(201).json({
          message: "File created in draft mode (no attachments)",
          id: fileResult.insertId,
          attachment_count: 0
        });
      }
    });
  }
);





app.put("/createfilewithattachments/:id", upload.array("file", 10), (req, res) => {
  const fileId = req.params.id;

  const {
    file_name,
    file_subject,
    sender,
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
       
     
      receiver = ?, 
      date_added = ?, 
      current_status = ?, 
      remarks = ?,
      department = ?,
      division = ?,
      unit = ?,
      status = ?,
      sender = ?
    WHERE id = ?
  `;

  const updateFileValues = [
    // file_name,
    // file_subject,
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
    sender,
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
  const departmentId = req.query.department;
  const division = req.query.division;
  const unit = req.query.unit;
  const mode = req.query.mode; // ✅ 'created' or 'received'

  const isGSO = departmentId && departmentId.toUpperCase() === "OGS";

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

    // ✅ Apply "mode" logic
    if (!isGSO) {
      if (mode === "created") {
        query += ` AND department = ?`;
        values.push(departmentId);
      } else if (mode === "received") {
        query += ` AND receiver = ?`;
        values.push(departmentId);
      } else if (mode === "forwarded") {
        query += ` AND sender = ? OR file_id LIKE ?`;
        values.push(departmentId, `${departmentId}/%`);
      } else {
        query += ` AND (department = ? OR receiver = ?)`;
        values.push(departmentId, departmentId);
      }
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
    if (mode === "created") {
      conditions.push(`department = ?`);
      values.push(departmentId);
    } else if (mode === "received") {
      conditions.push(`receiver = ?`);
      values.push(departmentId);
    } else if (mode === "forwarded") {
      conditions.push(`sender = ? OR file_id LIKE ?`);
      values.push(departmentId, `${departmentId}/%`);
    } else {
      conditions.push(`(department = ? OR receiver = ?)`);
      values.push(departmentId, departmentId);
    }
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
  console.log('departId===', departmentId)

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
  console.log('fileId===', fileId)

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
  const { note, userId, fileId } = req.body;
  if (!fileId || !userId || !note) {
    return res.status(400).json({ error: 'File number, user, and note are required' });
  }
  const createdAt = new Date(); // current date & time
  await dbPromise.query(
    'INSERT INTO notes (note, created_by,file_id, created_at) VALUES (?, ?, ?, ?)',
    [note, userId, fileId, createdAt]
  );
  res.status(201).send({ message: 'Note created' });
});



app.get('/api/documents/:id/notes', async (req, res) => {
  const { id } = req.params;


  const [notes] = await dbPromise.query(`
    SELECT n.note, n.created_at, n.created_by, n.id, u.username,u.department
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



app.put("/api/files/:id/reset-expiry", async (req, res) => {
  const { id } = req.params;
  const newExpiryDate = new Date(); // +1 day from now

  try {
    await dbPromise.query(
      `UPDATE files SET date_added = ?, status = 'active', expiry = 0 WHERE id = ?`,
      [newExpiryDate, id]
    );
    res.json({ message: "File expiry reset successfully", newExpiryDate });
  } catch (error) {
    console.error("Error resetting expiry:", error);
    res.status(500).json({ error: "Failed to reset expiry" });
  }
});


function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  // console.log('req',req.headers.authorization,'============================', req.headers.authorization?.split(" ")[1])

  // const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;  // <-- NOW req.user is available
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}


app.post("/api/files/:id/request-priority", verifyToken, async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  try {
    // Check if already pending
    const [pending] = await dbPromise.query(
      "SELECT * FROM priority_requests WHERE file_id = ? AND status = 'pending'",
      [fileId]
    );

    if (pending.length > 0) {
      return res.status(400).json({ message: "A request is already pending." });
    }

    // Create request
    await dbPromise.query(
      "INSERT INTO priority_requests (file_id, requested_by, status) VALUES (?, ?, 'pending')",
      [fileId, userId]
    );

    return res.json({
      message: "High priority request submitted to admin.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/admin/priority-requests", async (req, res) => {
  try {
    const [rows] = await dbPromise.query(
      `SELECT 
          pr.id AS request_id,
          pr.file_id,
          f.file_subject,
          f.department AS file_department,
          f.file_id AS fileId,
          pr.requested_by,
          u.username AS requested_by_username,
          u.department AS requested_by_department,
          pr.status,
          pr.created_at
       FROM priority_requests pr
       JOIN files f ON pr.file_id = f.id
       JOIN signup u ON pr.requested_by = u.id
       WHERE pr.status = 'pending'
       ORDER BY pr.created_at DESC`
    );

    res.json(rows);

  } catch (error) {
    console.error("Error fetching priority requests:", error);
    res.status(500).json({ error: "Server error" });
  }
});



app.put(`/api/admin/priority-requests/:requestId/approve`, async (req, res) => {
  const requestId = req.params.requestId;

  try {
    // Get file_id from priority_requests
    const [requestRows] = await dbPromise.query(
      "SELECT file_id FROM priority_requests WHERE id = ?",
      [requestId]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const fileId = requestRows[0].file_id;

    // Update priority request status
    await dbPromise.query(
      "UPDATE priority_requests SET status = 'approved' WHERE id = ?",
      [requestId]
    );

    // Mark the file as high priority
    await dbPromise.query(
      "UPDATE files SET is_high_priority = 1 WHERE id = ?",
      [fileId]
    );

    res.json({
      success: true,
      message: "High priority request approved and file updated."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to approve the request." });
  }
});



app.put("/api/admin/priority-requests/:requestId/reject", async (req, res) => {
  const requestId = req.params.requestId;

  try {
    // 1️⃣ Check if request exists
    const [requestRows] = await dbPromise.query(
      "SELECT file_id FROM priority_requests WHERE id = ?",
      [requestId]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    // 2️⃣ Update priority request status to rejected
    await dbPromise.query(
      "UPDATE priority_requests SET status = 'rejected' WHERE id = ?",
      [requestId]
    );

    res.json({
      success: true,
      message: "High priority request rejected."
    });

  } catch (error) {
    console.error("Reject Error:", error);
    res.status(500).json({ error: "Failed to reject the request." });
  }
});


app.get("/api/files/high-priority/:departmentId", async (req, res) => {
  const departmentId = req.params.departmentId;

  try {
    const [rows] = await dbPromise.query(
      `SELECT * FROM files 
       WHERE is_high_priority = 1 
       AND receiver = ?
       ORDER BY date_added DESC`,
      [departmentId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch high priority files" });
  }
});


app.get("/api/high-priority/status", async (req, res) => {
  const { fileId, userId } = req.query;

  const [rows] = await dbPromise.query(
    "SELECT status FROM priority_requests WHERE file_id=? AND requested_by=? ORDER BY id DESC LIMIT 1",
    [fileId, userId]
  );

  res.json(rows[0] || { status: null });
});

app.get("/api/admin/dept-stats", async (req, res) => {
  try {
    const query = `
      SELECT
          department,
          SUM(createdCount) AS createdCount,
          SUM(receivedCount) AS receivedCount,
          SUM(expiredCount) AS expiredCount
      FROM (
          SELECT 
              sender AS department,
              1 AS createdCount,
              0 AS receivedCount,
              0 AS expiredCount
          FROM files
      
          UNION ALL
      
          SELECT 
              receiver AS department,
              0 AS createdCount,
              1 AS receivedCount,
              IF(expiry = 1, 1, 0) AS expiredCount
          FROM files
      ) AS combined
      GROUP BY department
      ORDER BY department;
    `;

    const [rows] = await dbPromise.query(query);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get("/api/inbox", async (req, res) => {
  try {
    const department = req.query.department;

    if (!department) {
      return res.status(400).json({ error: "Department is required" });
    }

    const query = `
      SELECT *
      FROM files
      WHERE receiver = ?
      ORDER BY id DESC;
    `;

    const [rows] = await dbPromise.query(query, [department]);

    res.json(rows);
  } catch (err) {
    console.error("Error in /api/inbox:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// app.post("/upload", upload.array("files"), (req, res) => {
//   const folderName = req.body.fileName;

//   const uploadedFiles = req.files.map((file) => ({
//     // fileName: file.originalname,
//     folder: folderName,
//     filename: file.originalname,   
//     path: `${file.destination}/${file.originalname}`,
//   }));

//   res.json({ uploadedFiles });
// });
/////////////////////////////////////////////////////////////////
// app.post("/upload", upload.array("files"), (req, res) => {
//   let fileName = req.body.fileName;      // e.g., "10th_marksheet.pdf"
//   // const folderName = fileName.split(".")[0];  // → "10th_marksheet"

//   const folderPath = path.join(__dirname, "uploads", fileName);

//   // Create folder if not exist
//   if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath, { recursive: true });
//   }

//   // Move uploaded files into this folder
//   const uploadedFiles = req.files.map((file) => {
//     const newPath = path.join(folderPath, file.originalname);
//     fs.renameSync(file.path, newPath);

//     return {
//       filename: file.originalname,
//       path: `uploads/${fileName}/${file.originalname}`, // to display in frontend    
//     };
//   });

//   res.json({ uploadedFiles });
// });

app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const fileName = req.body.fileName;     // folder name
    const recordId = req.body.recordId;     // <- foreign key to save in DB (VERY IMPORTANT)
    // const safeFolderName = fileName.replace(/\//g, "_");

    const folderPath = path.join(__dirname, "uploads", fileName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const newPath = path.join(folderPath, file.originalname);
      fs.renameSync(file.path, newPath);

      const filePath = `uploads/${fileName}/${file.originalname}`;

      uploadedFiles.push({
        filename: file.originalname,
        path: filePath,
      });

      // ⭐ INSERT INTO DATABASE
      await dbPromise.query(
        "INSERT INTO attachments (file_id, filename, path) VALUES (?, ?, ?)",
        [recordId, file.originalname, filePath]
      );
    }

    res.json({
      message: "Files uploaded & inserted into database",
      uploadedFiles,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});





app.post("/uploadStep2", uploadStep2.array("files", 10), (req, res) => {
  const formattedFiles = req.files.map((file) => ({
    filename: file.originalname,
    // path: baseUrl + file.path.replace(/\\/g, "/"), // Fix Windows slashes
  }));
  res.json({
    message: "Step 2 upload successful - department folder created",
    files: formattedFiles
  });
});
















// app.post("/upload", upload.array("files"), (req, res) => {
//   let folderName = req.body.fileName;
//   folderName = folderName.split(".")[0]; // remove extension

//   const folderPath = path.join(__dirname, "uploads", folderName);

//   if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath, { recursive: true });
//   }

//   const uploadedFiles = req.files.map(file => {
//     const newPath = path.join(folderPath, file.originalname);
//     fs.renameSync(file.path, newPath);
//     return {
//       filename: file.originalname,
//       path: `${folderName}/${file.originalname}`,
//     };
//   });

//   res.json({ uploadedFiles });
// });


// app.get("/attachments/:fileName", (req, res) => {
//    const folderName = decodeURIComponent(req.params.fileName);
//   const folderPath = path.join(__dirname, "uploads", folderName);

//   if (!fs.existsSync(folderPath)) {
//     return res.json([]); // folder does not exist yet
//   }

//   const files = fs.readdirSync(folderPath).map((filename) => ({
//     filename,
//     path: `uploads/${folderName}/${filename}`,
//   }));

//   res.json(files);
// });
//////////////////////////////////////////////////////

// app.get("/attachments/:fileName", (req, res) => {
//   // const { fileName } = req.params;
//   const fileName = decodeURIComponent(req.params.fileName);
//   console.log('fileName=========================', fileName)
//   const safeFolderName = fileName.replace(/\//g, "-");
//   console.log('safeFolderNamee=========================', safeFolderName)
//   // const uploadsRoot = path.join(__dirname, "..", "uploads", safeFolderName);
//   const uploadsRoot = path.join(
//     process.cwd(),
//     "..",
//     "uploads",
//     safeFolderName
//   );
//   console.log("Resolved uploadsRoot:", uploadsRoot);
//   console.log("Exists:", fs.existsSync(uploadsRoot));

//   console.log("CWD:", process.cwd());
//   console.log("Uploads dir exists:",
//     fs.existsSync(path.join(process.cwd(), "uploads"))
//   );

//   // If file folder does not exist
//   if (!fs.existsSync(uploadsRoot)) {
//     return res.json({});
//   }

//   const result = {};

//   try {
//     // Read department folders
//     const departments = fs.readdirSync(uploadsRoot, {
//       withFileTypes: true
//     });

//     departments.forEach(deptDir => {
//       if (deptDir.isDirectory()) {
//         const deptName = deptDir.name;
//         const deptPath = path.join(uploadsRoot, deptName);

//         const files = fs.readdirSync(deptPath);

//         result[deptName] = files.map(file => ({
//           file_name: file,
//           file_path: `/uploads/${safeFolderName}/${deptName}/${file}`
//         }));
//       }
//     });

//     res.json(result);

//   } catch (err) {
//     console.error("Error reading attachments:", err);
//     res.status(500).json({ message: "Failed to read attachments" });
//   }
// });
app.get("/attachments/:fileName", (req, res) => {
  const fileName = decodeURIComponent(req.params.fileName);
  const safeFolderName = fileName.replace(/[\/\\]/g, "-");

  const uploadsRoot = path.join(
    process.cwd(),
    "uploads",
    safeFolderName
  );

  console.log("uploadsRoot:", uploadsRoot);
  console.log("Exists:", fs.existsSync(uploadsRoot));

  console.log("Raw contents:", fs.readdirSync(uploadsRoot, { withFileTypes: true }));

  if (!fs.existsSync(uploadsRoot)) {
    return res.json({});
  }

  const result = {};
  const departments = fs.readdirSync(uploadsRoot, { withFileTypes: true });

  departments.forEach(dept => {
    if (!dept.isDirectory()) return;

    const deptPath = path.join(uploadsRoot, dept.name);
    const files = fs.readdirSync(deptPath);

    result[dept.name] = files.map(file => ({
      file_name: file,
      file_path: `/uploads/${safeFolderName}/${dept.name}/${file}`
    }));
  });

  res.json(result);
});



app.put("/api/files/:id/status", async (req, res) => {
  console.log('id=================================================')
  const { id } = req.params;
  const { status } = req.body;
  // const userId = req.user.id;
  console.log('id==============', id, status)

  const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  await dbPromise.query(
    `UPDATE files SET status = ? WHERE id = ?`,
    [status, id]
  );

  res.status(200).json({
    message: "File status updated successfully",
    status
  });
});


app.put("/api/files/:id/send", async (req, res) => {
  const { id } = req.params;
  const { toDepartment } = req.body;

  // from auth middleware
  // const user = req.user;  

  if (!toDepartment) {
    return res.status(400).json({ message: "Target department required" });
  }

  try {
    // 1️⃣ Fetch file
    const [[file]] = await dbPromise.query(
      "SELECT * FROM files WHERE id = ?",
      [id]
    );

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // 2️⃣ Permission check
    // if (file.current_department !== user.department) {
    //   return res.status(403).json({
    //     message: "You cannot send a file not in your department"
    //   });
    // }

    // 3️⃣ Prevent re-sending
    if (file.status !== "DRAFT" && file.status !== "pending") {
      return res.status(400).json({
        message: "Only draft files can be sent"
      });
    }

    // 4️⃣ Update file routing
    await dbPromise.query(
      `UPDATE files
       SET department = ?,
           receiver = ?,
           sender = ?,
           status = 'pending'
       WHERE id = ?`,
      [toDepartment, toDepartment, file?.department, id]
    );

    // 5️⃣ (Optional but recommended) Audit log
    // await dbPromise.query(
    //   `INSERT INTO file_events
    //    (file_id, event_type, origin, forwarded_to, user_id, created_at)
    //    VALUES (?, 'sent', ?, ?, ?, NOW())`,
    //   [id, user.department, toDepartment, user.id]
    // );

    res.json({
      message: "File sent successfully",
      fileId: id,
      from: file.department,
      to: toDepartment
    });

  } catch (err) {
    console.error("Send file error:", err);
    res.status(500).json({ message: "Failed to send file" });
  }
});




app.use((req, res, next) => {
  console.log("Unknown route:", req.method, req.url);
  res.status(404).send("Not Found");
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});