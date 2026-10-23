// Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.

const express = require("express");
const mongoose = require("mongoose");
const Job = require("../models/Job");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();
    res.json(
      jobs.map((job) => ({
        ...job,
        id: job._id.toString(),
        _id: undefined,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: "Unable to load jobs" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Only recruiters can create jobs" });
    }

    const { title, company, location, description } = req.body;
    if (![title, company, location, description].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ error: "All job fields are required" });
    }

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      description: description.trim(),
      recruiterId: new mongoose.Types.ObjectId(req.user.id),
    });

    res.status(201).json({ ...job.toObject(), id: job._id.toString() });
  } catch (error) {
    res.status(500).json({ error: "Unable to create job" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "recruiter" || !mongoose.isValidObjectId(req.params.id)) {
      return res.status(403).json({ error: "Only recruiters can delete jobs" });
    }

    const deletedJob = await Job.findOneAndDelete({
      _id: req.params.id,
      recruiterId: req.user.id,
    });

    if (!deletedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ message: "Job deleted successfully", id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: "Unable to delete job" });
  }
});

module.exports = router;
