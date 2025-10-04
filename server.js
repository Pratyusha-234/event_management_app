const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));

app.use(
  session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
  })
);

 //--- Home route ---
app.get('/', (req, res) => {
  if (req.session.username) {
    res.send(`<h2>Welcome, ${req.session.username}!</h2>
              <a href="/logout">Logout</a>`);
  } else {
    res.sendFile(__dirname + '/views/login.html');
  }
});

// // --- Register page ---
// app.get('/register', (req, res) => {
//   res.sendFile(__dirname + '/views/register.html');
// });

// // // --- Register user ---
// app.post('/register', async (req, res) => {
//   const { username, password } = req.body;

//   const hashedPassword = await bcrypt.hash(password, 10);

//   db.query(
//     'INSERT INTO users (username, password) VALUES (?, ?)',
//     [username, hashedPassword],
//     (err) => {
//       if (err) {
//         console.error(err);
//         res.send('Error registering user.');
//       } else {
//         res.redirect('/');
//       }
//     }
//   );
// });

// // --- Login user ---
// app.post('/login', (req, res) => {
//   const { username, password } = req.body;

//   db.query(
//     'SELECT * FROM users WHERE username = ?',
//     [username],
//     async (err, results) => {
//       if (err || results.length === 0) {
//         return res.send('User not found.');
//       }

//       const user = results[0];
//       const match = await bcrypt.compare(password, user.password);

//       if (match) {
//         req.session.username = user.username;
//         res.redirect('/');
//       } else {
//         res.send('Incorrect password.');
//       }
//     }
//   );
// });

// // --- Logout user ---
// app.get('/logout', (req, res) => {
//   req.session.destroy(() => {
//     res.redirect('/');
//   });
// });

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
