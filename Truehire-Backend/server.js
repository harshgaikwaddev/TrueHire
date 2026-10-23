// Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.

const { loadEnvFile } = require("node:process");

try {
  loadEnvFile();
} catch (err) {
  if (err.code !== "ENOENT") {
    throw err;
  }
}

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use('/api/execute', require('./routes/execute'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/jobs', require('./routes/jobs'));

const User = require("./models/User");
const auth = require("./middleware/auth");
const { authorizeRoles } = auth;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.json({ message: "Server running" });
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "student" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: { name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(user.password);
    const isMatch = isBcryptHash
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    if (!isBcryptHash) {
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});

app.get("/profile", auth, (req, res) => {
  res.json({ message: "Welcome " + req.user.name, user: req.user });
});

app.get("/student-dashboard", auth, authorizeRoles("student"), (req, res) => {
  res.json({ message: "Student dashboard access granted", user: req.user });
});

app.get("/recruiter-dashboard", auth, authorizeRoles("recruiter"), (req, res) => {
  res.json({ message: "Recruiter dashboard access granted", user: req.user });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port 5000");
});