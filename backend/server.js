const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");

// Create the Express application
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: "http://127.0.0.1:5501" }));

// MySQL database connection configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Ritik@123",
  database: "railwayreservation", // Replace with your actual database name
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// API endpoint to accept user details and store them in the database

app.post("/register", (req, res) => {
  console.log(req.body); // Log to verify data
  const {
    first_name,
    last_name,
    adhar_no,
    gender,
    age,
    mobile_no,
    email,
    city,
    state,
    pincode,
    password,
    security_ques,
    security_ans,
  } = req.body;

  const query = `
    INSERT INTO USER (first_name, last_name, adhar_no, gender, age, mobile_no, email, city, state, pincode, password, security_ques, security_ans)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    first_name,
    last_name,
    adhar_no,
    gender,
    age,
    mobile_no,
    email,
    city,
    state,
    pincode,
    password,
    security_ques,
    security_ans,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting data into the database:", err);
      return res.status(500).send({ message: "Database error" });
    }
    res.status(201).send({
      message: "User registered successfully",
      userId: result.insertId,
    });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Ensure both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .send({ success: false, message: "Username and password are required" });
  }

  // Query the database to check if the user exists and the password matches
  const query = "SELECT * FROM USER WHERE email = ? AND password = ?";
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res
        .status(500)
        .send({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      // User found and password matches
      return res
        .status(200)
        .send({ success: true, message: "Login successful" });
    } else {
      // User not found or invalid credentials
      return res
        .status(401)
        .send({ success: false, message: "Invalid username or password" });
    }
  });
});

app.post("/train-status-by-number", (req, res) => {
  const { trainNo } = req.body; // Get trainNo from the request body

  if (!trainNo) {
    return res.status(400).json({ error: "Train number is required" });
  }

  // SQL query to fetch train status by train number
  const query = `SELECT * FROM TRAIN_STATUS WHERE train_no = ?`;

  db.query(query, [trainNo], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Train not found" });
    }

    res.json(result[0]); // Return train status
  });
});

app.post("/train-status-by-route", (req, res) => {
  const { source, destination } = req.body; // Get source and destination from the request body

  if (!source || !destination) {
    return res
      .status(400)
      .json({ error: "Source and destination are required" });
  }

  // SQL query to fetch train number by source and destination
  const query = `SELECT train_no FROM TRAIN WHERE source = ? AND destination = ?`;

  db.query(query, [source, destination], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No trains found for the given route" });
    }

    const trainNo = result[0].train_no; // Get the train number

    // Fetch the train status using the train number
    const statusQuery = `SELECT * FROM TRAIN_STATUS WHERE train_no = ?`;
    db.query(statusQuery, [trainNo], (err, statusResult) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (statusResult.length === 0) {
        return res.status(404).json({ error: "Train status not found" });
      }

      res.json(statusResult[0]); // Return train status
    });
  });
});

app.get("/train-status", (req, res) => {
  const query = "SELECT * FROM TRAIN_STATUS";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching train status:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

app.get("/train-details/:trainNo", (req, res) => {
  const trainNo = req.params.trainNo;

  // SQL query to fetch train details by train number
  const query = "SELECT * FROM TRAIN WHERE train_no = ?";

  // Use db.query instead of pool.execute
  db.query(query, [trainNo], (err, results) => {
    if (err) {
      console.error("Error fetching train details:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Train not found" });
    }

    // Send the train details as the response
    res.json(results[0]);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
