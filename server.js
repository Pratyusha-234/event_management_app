const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
const PORT = 3000;

// ---- MIDDLEWARE: MUST be before your routes ----
app.use(express.json()); // parses application/json
app.use(express.urlencoded({ extended: true })); // parses form-urlencoded

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));

app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
  })
);

//--- Home route ---
app.get("/", (req, res) => {
  if (req.session.username) {
    res.send(`<h2>Welcome, ${req.session.username}!</h2>
              <a href="/logout">Logout</a>`);
  } else {
    res.sendFile(__dirname + "/views/login.html");
  }
});

// --- Register page ---
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/views/register.html");
});

// // --- Register user ---
app.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Correct query placeholders (3 values → 3 ?)
    db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role],
      (err, result) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res
            .status(500)
            .json({ success: false, message: "Database error", error: err });
        }

        // Success response
        return res.status(201).json({
          success: true,
          message: "User registered successfully!",
          data: {
            id: result.insertId,
            username,
            role,
          },
        });
      }
    );
  } catch (error) {
    console.error("Server error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
});

// --- Login user ---
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Find user
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      if (results.length === 0)
        return res
          .status(401)
          .json({ success: false, message: "User not found" });

      const user = results[0];

      // Compare password
      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res
          .status(401)
          .json({ success: false, message: "Incorrect password" });

      // Success
      return res.status(200).json({
        success: true,
        message: "Login successful!",
        role: user.role,
      });
    }
  );
});

// // --- Logout user ---
// app.get('/logout', (req, res) => {
//   req.session.destroy(() => {
//     res.redirect('/');
//   });
// });

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
