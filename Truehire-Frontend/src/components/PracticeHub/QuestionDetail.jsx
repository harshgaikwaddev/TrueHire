/**
 * Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.
 *
 * QuestionDetail.jsx
 * 
 * Interactive code solving workspace for a selected question.
 * Features code editor with tab indentation, language templates,
 * custom stdin execution, and official test case submission.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useCodeRunner } from './useCodeRunner';
import TestResultsPanel from './TestResultsPanel';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const STARTER_TEMPLATES = {
  javascript: `// Read input from stdin
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();

// Write your solution here
`,
  python: `# Read input from stdin
import sys
input_data = sys.stdin.read().strip()

# Write your solution here
`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Write your solution here
    }
}
`
};

export default function QuestionDetail({ questionId, onBack }) {
  const [question, setQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [questionError, setQuestionError] = useState(null);

  const [language, setLanguage] = useState('javascript');
  const [codeMap, setCodeMap] = useState({
    javascript: STARTER_TEMPLATES.javascript,
    python: STARTER_TEMPLATES.python,
    java: STARTER_TEMPLATES.java
  });
  const [customStdin, setCustomStdin] = useState('');
  const [activeResultTab, setActiveResultTab] = useState('run');

  const textareaRef = useRef(null);

  const {
    running,
    submitting,
    loading,
    runResult,
    submitResult,
    error,
    runCode,
    submitCode
  } = useCodeRunner();

  // Fetch full question details including test cases
  useEffect(() => {
    async function fetchDetail() {
      setLoadingQuestion(true);
      setQuestionError(null);
      try {
        const res = await fetch(`${API_BASE}/api/questions/${questionId}`);
        if (!res.ok) {
          throw new Error(`Failed to load question (status ${res.status})`);
        }
        const data = await res.json();
        setQuestion(data);
        // Pre-fill custom stdin with sample input from first test case
        if (data.testCases && data.testCases.length > 0) {
          setCustomStdin(data.testCases[0].input || '');
        }
      } catch (err) {
        setQuestionError(err.message || 'Error fetching question');
      } finally {
        setLoadingQuestion(false);
      }
    }
    fetchDetail();
  }, [questionId]);

  const currentCode = codeMap[language] || '';

  const handleCodeChange = (newCode) => {
    setCodeMap((prev) => ({
      ...prev,
      [language]: newCode
    }));
  };

  // Intercept Tab key in textarea to insert 2 spaces instead of losing focus
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '  ';

      const updatedCode =
        currentCode.substring(0, start) + spaces + currentCode.substring(end);

      handleCodeChange(updatedCode);

      // Move cursor after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
    }
  };

  // Handle Run Code action
  const handleRun = async () => {
    setActiveResultTab('run');
    await runCode({
      language,
      code: currentCode,
      stdin: customStdin
    });
  };

  // Handle Submit Solution action
  const handleSubmit = async () => {
    setActiveResultTab('submit');
    await submitCode({
      language,
      code: currentCode,
      questionId
    });
  };

  if (loadingQuestion) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 animate-pulse">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-semibold">Loading challenge workspace...</p>
      </div>
    );
  }

  if (questionError || !question) {
    return (
      <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-8 text-center text-rose-300">
        <p className="font-bold text-sm mb-2">Error loading challenge</p>
        <p className="text-xs mb-4">{questionError || 'Question not found'}</p>
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
        >
          Back to Question List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors self-start"
        >
          Back to Challenges
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python (3.x)</option>
            <option value="java">Java (OpenJDK)</option>
          </select>

          <button
            onClick={() => handleCodeChange(STARTER_TEMPLATES[language])}
            title="Reset code to starter template"
            className="text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            Reset Code
          </button>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem Description & Sample Cases (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="text-xl font-bold text-white">{question.title}</h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    question.difficulty.toLowerCase() === 'easy'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : question.difficulty.toLowerCase() === 'medium'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {question.difficulty}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">ID: {question.id}</div>
            </div>

            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans border-t border-slate-800 pt-3">
              {question.description}
            </div>

            {/* Sample Test Cases */}
            {question.testCases && question.testCases.length > 0 && (
              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Sample Test Cases
                </div>
                <div className="space-y-2.5">
                  {question.testCases.slice(0, 2).map((tc, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                      <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">
                        Sample #{idx + 1}
                      </div>
                      <div className="text-slate-400 mb-1">
                        <span className="text-slate-500">Input: </span>
                        <span className="text-slate-200">{tc.input}</span>
                      </div>
                      <div className="text-slate-400">
                        <span className="text-slate-500">Output: </span>
                        <span className="text-emerald-400">{tc.expectedOutput}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor + Custom Stdin + Run/Submit + Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Code Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold font-mono">
                {language === 'javascript' ? 'solution.js' : language === 'python' ? 'solution.py' : 'Main.java'}
              </span>
              <span className="text-[11px]">Tab inserts 2 spaces</span>
            </div>

            <textarea
              ref={textareaRef}
              value={currentCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              className="w-full h-80 bg-slate-950 text-slate-100 font-mono text-xs p-4 resize-y focus:outline-none focus:ring-1 focus:ring-cyan-500/50 leading-5"
              placeholder="// Type your code here..."
            />
          </div>

          {/* Custom Stdin Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Custom Standard Input (stdin)
              </label>
              <button
                onClick={() => setCustomStdin(question.testCases?.[0]?.input || '')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Use Sample Input
              </button>
            </div>
            <textarea
              value={customStdin}
              onChange={(e) => setCustomStdin(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-y"
              placeholder="Enter standard input for your run..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow"
            >
              {running ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                  <span>Running...</span>
                </>
              ) : (
                <span>Run Code</span>
              )}
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Solution</span>
              )}
            </button>
          </div>

          {/* Results Display Panel */}
          <TestResultsPanel
            activeTab={activeResultTab}
            setActiveTab={setActiveResultTab}
            running={running}
            submitting={submitting}
            runResult={runResult}
            submitResult={submitResult}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
