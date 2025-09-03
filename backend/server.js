const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = 5000;

const mysql = require("mysql2");

app.use(cors());
app.use(express.json());





// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // your MySQL username
  password: "",   // your MySQL password
  database: "file_register_db"
});

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
    const files = req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      size: file.size,
      url: `http://localhost:5000/uploads/${file.filename}`
    }));


  //    const sql = `
  //   INSERT INTO files (file_id, file_name, file_subject, sender, receiver, date_added, inwardnum,outwardnum,current_status, remarks,department,size,path,url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?)
  // `;





    // await File.insertMany(files);
    res.status(200).json({ message: 'Files uploaded successfully', files: files });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading files', details: error.message});
  }
});
// Route to handle multiple file uploads
// app.post('/upload', upload.array('file', 10), (req, res) => {
//     res.status(200).json({ message: 'Files uploaded successfully!', file: req.file });
// });






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
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Check user in DB
  const sql = "SELECT * FROM signup WHERE username = ? AND passwd = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      // ✅ Login success
      res.json({
        message: "Login successful!",
        user: {
          id: results[0].id,
          username: results[0].username,
          email: results[0].email,
          department: results[0].department,
        },
      });
    } else {
      // ❌ Wrong username or password
      res.status(401).json({ error: "Invalid username or password" });
    }
  });
});

app.post("/createfile", async (req, res) => {
  const { file_name, file_subject,file_id,originator,file_recipient,date,inwardnum,outwardnum, current_status,remarks } = req.body;

  try {
    
      const insertQuery =
        " INSERT INTO files (file_id, file_name, file_subject, sender, receiver, date_added, inwardnum,outwardnum,current_status, remarks,department)     VALUES (?,?,?,?,?,?,?,?,?,?,?)";
      db.query(
        insertQuery,
        [file_id,file_name,file_subject,originator,file_recipient,date,inwardnum,outwardnum,current_status,remarks,''],
        (err, result) => {
          if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({ error: "Failed to create file" });
          }
          return res.status(201).json({ message: "File created successfully!" });
        }
      );
    }
  catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});
















// API: Fetch all files
app.get("/api/files", (req, res) => {
  const query = "SELECT * FROM files ORDER BY date_added DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching files:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});


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

































app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});