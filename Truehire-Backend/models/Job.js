// Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.

const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
