const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
var cookieParser = require("cookie-parser");

// Create the Express application
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // This parses incoming JSON requests

app.use(cors({ origin: "http://127.0.0.1:5501", credentials: true }));
app.use(cookieParser());

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

let user_id;

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
      user_id = user_id;
      // Send the user data as a response
      res.status(200).send({
        success: true,
        message: "Login successful",
        user: results[0], // Return the user data from the first result
      });
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

// adding passengers in the table

// Function to generate a random 4-digit passenger ID
const generatePassengerId = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

// Function to generate a random 4-digit PNR number
const generatePnrNumber = () => {
  return Math.floor(10 + Math.random() * 90);
};

// Function to generate a fixed ticket_id (starts with 'C')
const generateTicketId = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

app.post("/addPassengers", (req, res) => {
  const passengers = req.body.passengers;

  if (!passengers || passengers.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No passengers provided" });
  }

  // Extract user_ids from passengers or use globalUserId as a fallback
  const userIds = passengers.map(
    (passenger) => passenger.user_id || globalUserId
  );

  const sqlCheckUsers = "SELECT user_id FROM USER WHERE user_id IN (?)";

  db.query(sqlCheckUsers, [userIds], (err, result) => {
    if (err) {
      console.error("Error querying users:", err);
      return res
        .status(500)
        .json({
          success: false,
          message: "Database error when checking users",
        });
    }

    // Map the existing user_ids from the result
    const existingUserIds = result.map((row) => row.user_id);

    // Find any missing user_ids
    const missingUserIds = userIds.filter(
      (id) => !existingUserIds.includes(id)
    );

    if (missingUserIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `User IDs not found: ${missingUserIds.join(", ")}`,
      });
    }

    // If all user_ids exist, proceed with inserting passengers
    const sqlInsertPassengers = `
      INSERT INTO PASSENGER (passenger_id, pnr_no, age, gender, user_id, reservation_status, seat_number, name, ticket_id) 
      VALUES ?`;

    // Prepare values for batch insert
    const values = passengers.map((passenger) => [
      generatePassengerId(), // Assuming you have a function for this
      generatePnrNumber(), // Assuming you have a function for this
      passenger.age,
      passenger.gender,
      passenger.user_id || globalUserId, // Use user_id from passenger or globalUserId
      passenger.reservation_status,
      passenger.seat_number,
      passenger.name,
      passenger.ticket_id,
    ]);

    // Execute batch insert into PASSENGER table
    db.query(sqlInsertPassengers, [values], (err, result) => {
      if (err) {
        console.error("Error inserting passengers:", err);
        return res
          .status(500)
          .json({
            success: false,
            message: "Database error while inserting passengers",
          });
      }

      return res
        .status(200)
        .json({ success: true, message: "Passengers added successfully" });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
