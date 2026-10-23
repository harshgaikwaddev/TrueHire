/**
 * Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.
 *
 * TestResultsPanel.jsx
 * 
 * Displays code execution and test case evaluation results.
 * Clean, professional typography without informal emojis.
 */

import React from 'react';

export default function TestResultsPanel({
  activeTab,
  setActiveTab,
  running,
  submitting,
  runResult,
  submitResult,
  error
}) {
  const loading = running || submitting;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
      {/* Navigation tabs */}
      <div className="flex border-b border-slate-700 bg-slate-800/80 px-4 pt-2 gap-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab('run')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'run'
              ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Run Output
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'submit'
              ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Test Results{' '}
          {submitResult && (
            <span
              className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                submitResult.allPassed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {submitResult.allPassed ? 'Passed' : 'Failed'}
            </span>
          )}
        </button>
      </div>

      {/* Panel Content */}
      <div className="p-4 min-h-[160px] text-sm font-mono">
        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3 text-slate-400">
            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="text-xs font-sans animate-pulse">
              {running ? 'Executing code against custom input...' : 'Testing code against official test suite...'}
            </p>
          </div>
        )}

        {/* Generic Network or Validation Error */}
        {!loading && error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 font-sans text-xs mb-4">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Tab 1: Run Output */}
        {!loading && activeTab === 'run' && (
          <div>
            {!runResult && !error && (
              <p className="text-slate-500 italic py-6 text-center font-sans text-xs">
                Click "Run Code" to test your solution with custom standard input.
              </p>
            )}

            {runResult && (
              <div className="space-y-3 font-sans">
                {/* Compile Error */}
                {runResult.stage === 'compile' && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-lg">
                    <div className="text-rose-400 font-bold mb-2 text-xs">
                      Compilation Failed
                    </div>
                    <pre className="text-xs font-mono text-rose-300 bg-slate-950 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                      {runResult.compileError || runResult.stderr}
                    </pre>
                  </div>
                )}

                {/* Timeout */}
                {runResult.stage === 'timeout' && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-lg text-amber-300 text-xs">
                    <div className="font-bold mb-1">
                      Execution Timed Out
                    </div>
                    <p className="text-slate-400">
                      Execution exceeded the 5 second time limit. Check for infinite loops or high-complexity operations.
                    </p>
                  </div>
                )}

                {/* Success or Runtime Error */}
                {runResult.stage !== 'compile' && runResult.stage !== 'timeout' && (
                  <>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                      <span>Status: {runResult.exitCode === 0 ? <span className="text-emerald-400 font-semibold">Exit Code 0 (Success)</span> : <span className="text-rose-400 font-semibold">Exit Code {runResult.exitCode} (Runtime Error)</span>}</span>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-400 mb-1">Standard Output:</div>
                      <pre className="p-3 bg-slate-950 rounded-lg text-slate-200 font-mono text-xs overflow-x-auto min-h-[40px] whitespace-pre-wrap">
                        {runResult.stdout || <span className="text-slate-600 italic">(no stdout produced)</span>}
                      </pre>
                    </div>

                    {runResult.stderr && (
                      <div>
                        <div className="text-xs font-semibold text-rose-400 mb-1">Standard Error:</div>
                        <pre className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                          {runResult.stderr}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Test Results */}
        {!loading && activeTab === 'submit' && (
          <div>
            {!submitResult && !error && (
              <p className="text-slate-500 italic py-6 text-center font-sans text-xs">
                Click "Submit Solution" to run your code against all test cases.
              </p>
            )}

            {submitResult && (
              <div className="space-y-4 font-sans">
                {/* Compilation Error Early Exit */}
                {submitResult.stage === 'compile' && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-lg">
                    <div className="text-rose-400 font-bold mb-1 text-xs">Compilation Error</div>
                    <p className="text-xs text-slate-400 mb-2">Code failed to compile prior to test evaluation:</p>
                    <pre className="text-xs font-mono text-rose-300 bg-slate-950 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                      {submitResult.compileError}
                    </pre>
                  </div>
                )}

                {/* Overall Submission Banner */}
                {submitResult.success && (
                  <>
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        submitResult.allPassed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">
                          {submitResult.allPassed ? 'All Test Cases Passed' : 'Some Test Cases Failed'}
                        </div>
                        <div className="text-xs opacity-80 mt-0.5">
                          {submitResult.results.filter((r) => r.passed).length} of {submitResult.results.length} test cases passed
                        </div>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 font-semibold rounded ${
                          submitResult.allPassed
                            ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                            : 'bg-rose-500/20 border border-rose-400/40 text-rose-300'
                        }`}
                      >
                        {submitResult.allPassed ? 'ACCEPTED' : 'WRONG ANSWER'}
                      </span>
                    </div>

                    {/* Test Case Breakdown */}
                    <div className="space-y-3">
                      {submitResult.results.map((tc, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg border p-3.5 ${
                            tc.passed
                              ? 'bg-slate-950 border-emerald-500/30'
                              : 'bg-slate-950 border-rose-500/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-xs text-slate-300">
                              Test Case #{idx + 1}
                            </span>
                            <span
                              className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                                tc.passed
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {tc.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                            <div className="bg-slate-900 p-2 rounded border border-slate-800">
                              <span className="text-[10px] text-slate-500 uppercase block mb-1">Input</span>
                              <pre className="text-slate-300 whitespace-pre-wrap">{tc.input}</pre>
                            </div>

                            <div className="bg-slate-900 p-2 rounded border border-slate-800">
                              <span className="text-[10px] text-slate-500 uppercase block mb-1">Expected Output</span>
                              <pre className="text-emerald-400 whitespace-pre-wrap">{tc.expectedOutput}</pre>
                            </div>

                            <div className="bg-slate-900 p-2 rounded border border-slate-800">
                              <span className="text-[10px] text-slate-500 uppercase block mb-1">Actual Output</span>
                              <pre className={`whitespace-pre-wrap ${tc.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {tc.actualOutput || <span className="text-slate-600 italic">(empty)</span>}
                              </pre>
                            </div>
                          </div>

                          {tc.error && (
                            <div className="mt-2 text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-900/40">
                              <span className="font-bold">Reason: </span> {tc.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
