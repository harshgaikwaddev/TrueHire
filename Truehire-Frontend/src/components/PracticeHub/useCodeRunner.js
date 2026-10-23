/**
 * Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.
 *
 * useCodeRunner.js
 * 
 * Custom hook to handle code execution (/api/execute/run)
 * and test case submission (/api/execute/submit).
 */

import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function useCodeRunner() {
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);

  const resetResults = useCallback(() => {
    setRunResult(null);
    setSubmitResult(null);
    setError(null);
  }, []);

  // Run code against custom stdin
  const runCode = useCallback(async ({ language, code, stdin = '' }) => {
    setRunning(true);
    setError(null);
    setRunResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/execute/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language, code, stdin }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Execution failed';
        setError(errorMsg);
        setRunResult({
          success: false,
          stderr: errorMsg,
          exitCode: 1,
        });
      } else {
        setRunResult(data);
      }
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Network error connecting to execution service';
      setError(errorMsg);
      setRunResult({
        success: false,
        stderr: errorMsg,
        exitCode: 1,
      });
      return { success: false, error: errorMsg };
    } finally {
      setRunning(false);
    }
  }, []);

  // Submit code against all official test cases
  const submitCode = useCallback(async ({ language, code, questionId }) => {
    setSubmitting(true);
    setError(null);
    setSubmitResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/execute/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language, code, questionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Submission failed';
        setError(errorMsg);
        setSubmitResult({
          success: false,
          compileError: errorMsg,
          results: [],
        });
      } else {
        setSubmitResult(data);
      }
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Network error connecting to submission service';
      setError(errorMsg);
      setSubmitResult({
        success: false,
        compileError: errorMsg,
        results: [],
      });
      return { success: false, error: errorMsg };
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    running,
    submitting,
    loading: running || submitting,
    runResult,
    submitResult,
    error,
    runCode,
    submitCode,
    resetResults,
  };
}
