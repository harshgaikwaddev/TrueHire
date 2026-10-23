// Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "recruiter"], default: "student" }
});

module.exports = mongoose.model("User", userSchema);