/**
 * Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.
 *
 * services/codeExecutor.js
 * 
 * Isolated code execution service for multiple programming languages:
 * Python, C++, Java, and JavaScript.
 * 
 * Uses Node.js built-in modules only: child_process, fs/promises, os, path, crypto.
 */

const { spawn } = require('child_process');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

/**
 * Trims a single trailing newline (\r\n or \n) from output strings.
 * 
 * @param {string} str - The string to trim
 * @returns {string} String with trailing newline removed
 */
function trimTrailingNewline(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\r?\n$/, '');
}

/**
 * Spawns a child process and handles stdio, timeout, stdin piping, and termination.
 * 
 * @param {string} command - Executable to run
 * @param {string[]} args - Command line arguments
 * @param {object} options - Execution options
 * @param {string} options.cwd - Working directory for the process
 * @param {string} [options.stdin] - Optional input to pipe to process stdin
 * @param {number} [options.timeoutMs=5000] - Timeout in milliseconds
 * @param {object} [options.env] - Environment variables
 * @returns {Promise<{ stdout: string, stderr: string, exitCode: number|null, timedOut: boolean, spawnError: Error|null }>}
 */
function executeProcess(command, args, { cwd, stdin = '', timeoutMs = 5000, env = process.env } = {}) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let timeoutId = null;
    let spawnError = null;

    let child;
    try {
      child = spawn(command, args, { cwd, env });
    } catch (err) {
      return resolve({
        stdout: '',
        stderr: err.message,
        exitCode: 1,
        timedOut: false,
        spawnError: err
      });
    }

    // Enforce execution timeout: kill the process if time limit is reached
    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        try {
          // On Windows, child.kill() invokes TerminateProcess directly
          child.kill('SIGKILL');
        } catch (_) {
          // Process may have already terminated
        }
      }, timeoutMs);
    }

    // Capture standard output
    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    // Capture standard error
    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    // Pass input to the process's stdin
    if (child.stdin) {
      child.stdin.on('error', () => {
        // Prevent unhandled EPIPE if the process exits before stdin is closed
      });

      if (stdin !== undefined && stdin !== null && stdin !== '') {
        child.stdin.write(String(stdin));
      }
      child.stdin.end();
    }

    // Handle spawn-level errors (e.g., command not found / ENOENT)
    child.on('error', (err) => {
      spawnError = err;
    });

    // Capture completion when stdio streams close
    child.on('close', (code, signal) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      let exitCode = code;
      if (exitCode === null && signal) {
        exitCode = 1;
      } else if (exitCode === null && spawnError) {
        exitCode = 1;
      }

      resolve({
        stdout: trimTrailingNewline(stdout),
        stderr: trimTrailingNewline(stderr || (spawnError ? spawnError.message : '')),
        exitCode,
        timedOut,
        spawnError
      });
    });
  });
}

/**
 * Runs user-submitted code in an isolated temporary directory.
 * 
 * @param {object} params
 * @param {string} params.language - "python", "cpp", "java", or "javascript"
 * @param {string} params.code - Source code string
 * @param {string} [params.stdin] - Standard input to pass to the running code
 * @returns {Promise<{ stdout: string, stderr: string, exitCode: number|null, timedOut: boolean, compileError: string|null }>}
 */
async function runCode({ language, code = '', stdin = '' } = {}) {
  const lang = (language || '').toLowerCase().trim();
  const EXECUTION_TIMEOUT_MS = 5000;
  const COMPILE_TIMEOUT_MS = 10000;

  // Validate supported languages
  const supportedLanguages = ['python', 'cpp', 'java', 'javascript'];
  if (!supportedLanguages.includes(lang)) {
    return {
      stdout: '',
      stderr: `Unsupported language: '${language}'. Supported languages: ${supportedLanguages.join(', ')}`,
      exitCode: 1,
      timedOut: false,
      compileError: null
    };
  }

  // 1. Create a unique temp working directory under os.tmpdir() using crypto.randomUUID()
  const tempDirName = `code-exec-${crypto.randomUUID()}`;
  const tempDir = path.join(os.tmpdir(), tempDirName);
  await fs.mkdir(tempDir, { recursive: true });

  try {
    const isWindows = process.platform === 'win32';

    // 2. Language-specific file writing, compilation, and execution
    switch (lang) {
      case 'python': {
        // python -> write main.py
        const scriptPath = path.join(tempDir, 'main.py');
        await fs.writeFile(scriptPath, code, 'utf-8');

        // Run with `python main.py` (fallback to `python3` if `python` fails)
        let runRes = await executeProcess('python', ['main.py'], {
          cwd: tempDir,
          stdin,
          timeoutMs: EXECUTION_TIMEOUT_MS
        });

        // If python failed to spawn or exited with an error, attempt fallback to python3
        if (runRes.spawnError || runRes.exitCode !== 0) {
          const fallbackRes = await executeProcess('python3', ['main.py'], {
            cwd: tempDir,
            stdin,
            timeoutMs: EXECUTION_TIMEOUT_MS
          });

          // Use fallback result if python could not be spawned or if python3 succeeded
          if (runRes.spawnError || (!fallbackRes.spawnError && fallbackRes.exitCode === 0)) {
            runRes = fallbackRes;
          }
        }

        return {
          stdout: runRes.stdout,
          stderr: runRes.stderr,
          exitCode: runRes.exitCode,
          timedOut: runRes.timedOut,
          compileError: null
        };
      }

      case 'cpp': {
        // cpp -> write main.cpp
        const sourcePath = path.join(tempDir, 'main.cpp');
        await fs.writeFile(sourcePath, code, 'utf-8');

        // Compiled binary name: main.exe on Windows, main on non-Windows
        const exeName = isWindows ? 'main.exe' : 'main';

        // Compile with `g++ main.cpp -o main.exe` (or `main`)
        const compileRes = await executeProcess('g++', ['main.cpp', '-o', exeName], {
          cwd: tempDir,
          timeoutMs: COMPILE_TIMEOUT_MS
        });

        // If compilation fails, return compileError with compiler's stderr and do not run
        if (compileRes.exitCode !== 0 || compileRes.spawnError) {
          const compileError = compileRes.stderr || (compileRes.spawnError ? compileRes.spawnError.message : 'Compilation failed');
          return {
            stdout: '',
            stderr: compileError,
            exitCode: compileRes.exitCode ?? 1,
            timedOut: compileRes.timedOut,
            compileError
          };
        }

        // Run the compiled binary
        const binaryPath = path.join(tempDir, exeName);
        const runRes = await executeProcess(binaryPath, [], {
          cwd: tempDir,
          stdin,
          timeoutMs: EXECUTION_TIMEOUT_MS
        });

        return {
          stdout: runRes.stdout,
          stderr: runRes.stderr,
          exitCode: runRes.exitCode,
          timedOut: runRes.timedOut,
          compileError: null
        };
      }

      case 'java': {
        // java -> file must be named Main.java and public class named Main
        const sourcePath = path.join(tempDir, 'Main.java');
        await fs.writeFile(sourcePath, code, 'utf-8');

        // Compile with `javac Main.java`
        const compileRes = await executeProcess('javac', ['Main.java'], {
          cwd: tempDir,
          timeoutMs: COMPILE_TIMEOUT_MS
        });

        // If compilation fails, return compileError similarly and do not run
        if (compileRes.exitCode !== 0 || compileRes.spawnError) {
          const compileError = compileRes.stderr || (compileRes.spawnError ? compileRes.spawnError.message : 'Compilation failed');
          return {
            stdout: '',
            stderr: compileError,
            exitCode: compileRes.exitCode ?? 1,
            timedOut: compileRes.timedOut,
            compileError
          };
        }

        // Run with `java Main`, ensuring current working directory is included in classpath
        const javaEnv = {
          ...process.env,
          CLASSPATH: process.env.CLASSPATH ? `.${path.delimiter}${process.env.CLASSPATH}` : '.'
        };

        const runRes = await executeProcess('java', ['Main'], {
          cwd: tempDir,
          stdin,
          timeoutMs: EXECUTION_TIMEOUT_MS,
          env: javaEnv
        });

        return {
          stdout: runRes.stdout,
          stderr: runRes.stderr,
          exitCode: runRes.exitCode,
          timedOut: runRes.timedOut,
          compileError: null
        };
      }

      case 'javascript': {
        // javascript -> write main.js
        const scriptPath = path.join(tempDir, 'main.js');
        await fs.writeFile(scriptPath, code, 'utf-8');

        // Run with `node main.js`
        const runRes = await executeProcess('node', ['main.js'], {
          cwd: tempDir,
          stdin,
          timeoutMs: EXECUTION_TIMEOUT_MS
        });

        return {
          stdout: runRes.stdout,
          stderr: runRes.stderr,
          exitCode: runRes.exitCode,
          timedOut: runRes.timedOut,
          compileError: null
        };
      }

      default:
        return {
          stdout: '',
          stderr: `Unhandled language: ${lang}`,
          exitCode: 1,
          timedOut: false,
          compileError: null
        };
    }
  } finally {
    // 6. Always delete the temp directory and all its contents afterward, even on error
    try {
      await fs.rm(tempDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch (_) {
      // Ignore cleanup error if temp directory was already removed
    }
  }
}

// Support both `const { runCode } = require(...)` and `const runCode = require(...)`
runCode.runCode = runCode;
module.exports = runCode;
