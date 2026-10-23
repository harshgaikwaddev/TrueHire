/**
 * Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.
 *
 * routes/questions.js
 * 
 * Express router for retrieving practice questions.
 */

const express = require('express');
const router = express.Router();
const practiceQuestions = require('../data/practiceQuestions');

/**
 * GET /api/questions
 * Returns list of practice questions with testCases omitted.
 */
router.get('/', (req, res) => {
  const sanitizedList = practiceQuestions.map(({ id, title, difficulty, description }) => ({
    id,
    title,
    difficulty,
    description
  }));
  res.json(sanitizedList);
});

/**
 * GET /api/questions/:id
 * Returns the full question detail including test cases for sample display.
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const question = practiceQuestions.find((q) => q.id === id);

  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  res.json(question);
});

module.exports = router;
