/**
 * Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.
 *
 * scripts/testExecutor.js
 * 
 * Standalone test script to verify code execution across supported languages:
 * Python, C++, Java, and JavaScript.
 * 
 * Usage:
 *   node scripts/testExecutor.js
 */

const { runCode } = require('../services/codeExecutor');

// Test definitions: one simple test per language expecting stdout "5"
const testCases = [
  {
    language: 'python',
    code: 'print(2 + 3)',
    expectedStdout: '5'
  },
  {
    language: 'cpp',
    code: `#include <iostream>

int main() {
    std::cout << 2 + 3 << std::endl;
    return 0;
}`,
    expectedStdout: '5'
  },
  {
    language: 'java',
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println(2 + 3);
    }
}`,
    expectedStdout: '5'
  },
  {
    language: 'javascript',
    code: 'console.log(2 + 3);',
    expectedStdout: '5'
  }
];

async function runTests() {
  console.log('--- Running Code Executor Tests ---\n');

  const working = [];
  const notWorking = [];

  for (const test of testCases) {
    const { language, code, expectedStdout } = test;

    // Wrap each language test in its own try/catch so failure in one does not stop the others
    try {
      const result = await runCode({ language, code });

      if (result.compileError) {
        console.log(`[${language}] FAIL - compileError: ${result.compileError}`);
        notWorking.push(language);
      } else if (result.timedOut) {
        console.log(`[${language}] FAIL - timedOut: execution exceeded 5 second limit`);
        notWorking.push(language);
      } else if (result.stdout !== expectedStdout) {
        const errorDetail = result.stderr ? ` (stderr: ${result.stderr})` : '';
        console.log(`[${language}] FAIL - wrong output: expected "${expectedStdout}", got "${result.stdout}"${errorDetail}`);
        notWorking.push(language);
      } else if (result.exitCode !== 0) {
        const errorDetail = result.stderr ? ` (stderr: ${result.stderr})` : '';
        console.log(`[${language}] FAIL - non-zero exit code: ${result.exitCode}${errorDetail}`);
        notWorking.push(language);
      } else {
        console.log(`[${language}] PASS`);
        working.push(language);
      }
    } catch (err) {
      console.log(`[${language}] FAIL - unexpected exception: ${err.message}`);
      notWorking.push(language);
    }
  }

  // Print summary line
  const workingStr = working.length > 0 ? working.join(', ') : 'none';
  const notWorkingStr = notWorking.length > 0 ? notWorking.join(', ') : 'none';
  console.log(`\nWorking: ${workingStr} | Not working: ${notWorkingStr}`);
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
