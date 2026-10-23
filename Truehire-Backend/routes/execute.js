/**
 * Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.
 *
 * routes/execute.js
 * 
 * Express router for code execution endpoints.
 */

const express = require('express');
const router = express.Router();
const { runCode } = require('../services/codeExecutor');
const practiceQuestions = require('../data/practiceQuestions');

// Allowed languages for code execution ("cpp" is intentionally omitted)
const ALLOWED_LANGUAGES = ['python', 'java', 'javascript'];

/**
 * POST /api/execute/run
 * 
 * Executes a single code snippet.
 * Body: { language: string, code: string, stdin?: string }
 */
router.post('/run', async (req, res) => {
  try {
    const { language, code, stdin } = req.body || {};

    // Validate language
    if (!language || typeof language !== 'string' || !ALLOWED_LANGUAGES.includes(language.toLowerCase().trim())) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    // Validate code presence
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Guard against excessive payload size (> 20,000 characters)
    if (code.length > 20000) {
      return res.status(400).json({ error: 'Code too long' });
    }

    const normalizedLang = language.toLowerCase().trim();

    // Call code execution service
    const result = await runCode({
      language: normalizedLang,
      code,
      stdin: stdin || ''
    });

    // Check for compilation error (e.g., Java compile failure)
    if (result.compileError) {
      return res.status(200).json({
        success: false,
        stage: 'compile',
        ...result
      });
    }

    // Check for execution timeout
    if (result.timedOut) {
      return res.status(200).json({
        success: false,
        stage: 'timeout',
        ...result
      });
    }

    // Successful execution
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Execution failed',
      details: err.message
    });
  }
});

/**
 * POST /api/execute/submit
 * 
 * Runs code against all test cases for a specific question.
 * Body: { language: string, code: string, questionId: string }
 */
router.post('/submit', async (req, res) => {
  try {
    const { language, code, questionId } = req.body || {};

    // Validate language
    if (!language || typeof language !== 'string' || !ALLOWED_LANGUAGES.includes(language.toLowerCase().trim())) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    // Validate code
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Guard against excessive payload size
    if (code.length > 20000) {
      return res.status(400).json({ error: 'Code too long' });
    }

    // Validate questionId presence
    if (!questionId || typeof questionId !== 'string') {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    // Find the question from practiceQuestions bank
    const question = practiceQuestions.find((q) => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const normalizedLang = language.toLowerCase().trim();
    const results = [];

    // Run against each test case
    for (const testCase of question.testCases) {
      const result = await runCode({
        language: normalizedLang,
        code,
        stdin: testCase.input || ''
      });

      // If any test has a compileError, stop early and return it alone
      if (result.compileError) {
        return res.status(200).json({
          success: false,
          stage: 'compile',
          compileError: result.compileError
        });
      }

      const actualTrimmed = (result.stdout || '').trim().replace(/\r\n/g, '\n');
      const expectedTrimmed = (testCase.expectedOutput || '').trim().replace(/\r\n/g, '\n');
      const passed = !result.timedOut && result.exitCode === 0 && actualTrimmed === expectedTrimmed;

      let error = null;
      if (result.timedOut) {
        error = 'Time Limit Exceeded (>5s)';
      } else if (result.exitCode !== 0) {
        error = result.stderr || `Runtime Error (exit code ${result.exitCode})`;
      }

      results.push({
        input: testCase.input,
        expectedOutput: expectedTrimmed,
        actualOutput: actualTrimmed,
        passed,
        error
      });
    }

    const allPassed = results.every((r) => r.passed);
    return res.status(200).json({
      success: true,
      allPassed,
      results
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Submission failed',
      details: err.message
    });
  }
});

module.exports = router;
