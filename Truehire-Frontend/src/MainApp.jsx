// Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.

import React, { useState, useEffect } from 'react';

function MainApp() {
  const [screen, setScreen] = useState('landing'); // 'landing', 'workspace', 'results'
  const [selectedRole, setSelectedRole] = useState('Backend Developer (Node.js)');
  const [selectedCompany, setSelectedCompany] = useState('Swiggy');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Mid-Level');
  const [selectedTime, setSelectedTime] = useState(7200); // seconds (2 hours)
  const [timeRemaining, setTimeRemaining] = useState(7200);
  const [isPaused, setIsPaused] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentTab, setCurrentTab] = useState('jira');
  const [code, setCode] = useState('');
  const [testCode, setTestCode] = useState('');
  const [score, setScore] = useState(0);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState({});

  // Scenario data
  const scenario = {
    title: 'Restaurant Menu Loading Bug',
    company: 'Swiggy',
    description: 'Users in specific pin codes cannot see restaurant menus. Debug and fix the issue.',
    jiraTicket: {
      id: 'BUG-1247',
      priority: 'P0',
      status: 'To Do',
      title: 'Restaurant menus not loading for certain pin codes',
      description: 'Multiple users have reported that restaurant menus appear empty when accessing from specific geographic locations. The issue appears to be intermittent and affects approximately 15% of users in the 560001-560099 pin code range.',
      acceptanceCriteria: [
        'Menu items display correctly for all valid pin codes',
        'Appropriate error messages for invalid pin codes',
        'Response time under 500ms',
        'All existing tests pass plus 3 new test cases'
      ],
      comments: [
        { author: 'Priya Kumar', time: '2 hours ago', text: 'This is affecting our lunch rush orders. Priority escalated to P0.' },
        { author: 'Rahul Verma', time: '1 hour ago', text: 'I traced this to the menu_utils.js file. The pincode validation logic looks suspicious.' },
        { author: 'Sarah Chen', time: '45 min ago', text: 'QA confirmed: works fine with pincode "400001" but fails with "560001". Likely a type coercion issue?' }
      ]
    },
    slackChannels: {
      incidents: [
        { from: 'Sarah Chen', role: 'Engineering Manager', time: '9:47 AM', message: '🚨 URGENT - We\'re getting reports that restaurant menus aren\'t loading for users in certain pin codes. Can you investigate ASAP?', reactions: ['👀', '🔥'] },
        { from: 'Tech Support', role: 'Support Team', time: '9:52 AM', message: 'Getting 15+ customer complaints in the last hour. Peak lunch time 😰', reactions: ['😱'] },
        { from: 'You', role: 'Backend Developer', time: '9:55 AM', message: 'On it! Checking the logs now.' }
      ],
      backend: [
        { from: 'Priya Kumar', role: 'Tech Lead', time: '10:03 AM', message: 'Check the restaurant-service repo, specifically menu_utils.js. Might be related to the recent pincode validation changes.', reactions: ['👍'] },
        { from: 'Rahul Verma', role: 'QA Engineer', time: '10:08 AM', message: 'Tested with pin code 560001 - menu returns empty array. Works fine with 400001 though 🤔', thread: 3 },
        { from: 'Priya Kumar', role: 'Tech Lead', time: '10:12 AM', message: 'Also make sure to add proper test cases. We can\'t let this happen again.', reactions: ['💯'] },
        { from: 'Amit Shah', role: 'Senior Dev', time: '10:15 AM', message: 'Looks like a type comparison bug. Remember JavaScript\'s quirks with == vs ===', reactions: ['🎯'] }
      ]
    },
    buggyCode: `// menu_utils.js
/**
 * Fetches restaurant menu for a given location
 * @param {string} restaurantId - The restaurant identifier
 * @param {string} pincode - User's delivery location pincode
 * @returns {Promise<Array>} Menu items array
 */
async function getRestaurantMenu(restaurantId, pincode) {
  try {
    // Validate pincode format (6 digits)
    if (!pincode || pincode.length !== 6) {
      throw new Error('Invalid pincode format');
    }
    
    // Check if pincode is in serviceable range
    // BUG: Using || instead of ?? for default value
    const minServiceablePincode = process.env.MIN_PINCODE || 400000;
    const maxServiceablePincode = process.env.MAX_PINCODE || 600000;
    
    // BUG: String comparison instead of number comparison
    if (pincode < minServiceablePincode || pincode > maxServiceablePincode) {
      return { success: false, error: 'Area not serviceable', menu: [] };
    }
    
    // Fetch menu from database
    const menu = await db.query(
      'SELECT * FROM menu_items WHERE restaurant_id = ? AND is_active = true',
      [restaurantId]
    );
    
    // BUG: Not handling case when menu is empty but restaurant exists
    return {
      success: true,
      menu: menu.rows,
      metadata: {
        restaurantId,
        pincode,
        fetchedAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('Error fetching menu:', error);
    // BUG: Returning error object instead of throwing
    return { success: false, error: error.message };
  }
}

module.exports = { getRestaurantMenu };`,
    testCodeTemplate: `// menu_utils.test.js
const { getRestaurantMenu } = require('./menu_utils');

describe('getRestaurantMenu', () => {
  // TODO: Add at least 3 test cases
  
  test('should return menu for valid pincode', async () => {
    // Your test here
  });
  
  // Add more tests...
});`,
    correctSolution: `// Fixed menu_utils.js
async function getRestaurantMenu(restaurantId, pincode) {
  try {
    if (!pincode || pincode.length !== 6) {
      throw new Error('Invalid pincode format');
    }
    
    // FIX 1: Use ?? (nullish coalescing) and ensure numbers
    const minServiceablePincode = parseInt(process.env.MIN_PINCODE ?? '400000');
    const maxServiceablePincode = parseInt(process.env.MAX_PINCODE ?? '600000');
    
    // FIX 2: Convert pincode to number for proper comparison
    const pincodeNum = parseInt(pincode);
    
    if (pincodeNum < minServiceablePincode || pincodeNum > maxServiceablePincode) {
      return { success: false, error: 'Area not serviceable', menu: [] };
    }
    
    const menu = await db.query(
      'SELECT * FROM menu_items WHERE restaurant_id = ? AND is_active = true',
      [restaurantId]
    );
    
    // FIX 3: Handle empty menu case explicitly
    if (!menu.rows || menu.rows.length === 0) {
      return {
        success: true,
        menu: [],
        metadata: {
          restaurantId,
          pincode,
          message: 'No active menu items found',
          fetchedAt: new Date().toISOString()
        }
      };
    }
    
    return {
      success: true,
      menu: menu.rows,
      metadata: {
        restaurantId,
        pincode,
        fetchedAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('Error fetching menu:', error);
    // FIX 4: Throw error instead of returning it
    throw error;
  }
}`
  };

  // Initialize code on start
  useEffect(() => {
    if (screen === 'workspace' && !code) {
      setCode(scenario.buggyCode);
      setTestCode(scenario.testCodeTemplate);
    }
  }, [screen]);

  // Timer countdown
  useEffect(() => {
    if (screen === 'workspace' && !isPaused && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [screen, isPaused, timeRemaining]);

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start simulation
  const startSimulation = () => {
    setTimeRemaining(selectedTime);
    setScreen('workspace');
    setHintsUsed(0);
    setIsPaused(false);
  };

  // Evaluate solution
  const evaluateSolution = () => {
    let totalScore = 0;
    const feedbackItems = {};

    // Check for key fixes
    const hasNullishCoalescing = code.includes('??') || code.includes('||');
    const hasParsedPincode = code.includes('parseInt(pincode)') || code.includes('Number(pincode)');
    const hasEmptyMenuHandling = code.includes('menu.rows.length === 0') || code.includes('!menu.rows');
    const hasProperErrorHandling = code.includes('throw error') || code.includes('throw new Error');
    const hasTestCases = (testCode.match(/test\(/g) || []).length >= 3;

    // Scoring logic
    if (hasNullishCoalescing) {
      totalScore += 20;
      feedbackItems.nullishCoalescing = { passed: true, points: 20 };
    } else {
      feedbackItems.nullishCoalescing = { passed: false, points: 0 };
    }

    if (hasParsedPincode) {
      totalScore += 25;
      feedbackItems.typeCoercion = { passed: true, points: 25 };
    } else {
      feedbackItems.typeCoercion = { passed: false, points: 0 };
    }

    if (hasEmptyMenuHandling) {
      totalScore += 15;
      feedbackItems.edgeCases = { passed: true, points: 15 };
    } else {
      feedbackItems.edgeCases = { passed: false, points: 0 };
    }

    if (hasProperErrorHandling) {
      totalScore += 10;
      feedbackItems.errorHandling = { passed: true, points: 10 };
    } else {
      feedbackItems.errorHandling = { passed: false, points: 0 };
    }

    if (hasTestCases) {
      totalScore += 20;
      feedbackItems.testCoverage = { passed: true, points: 20 };
    } else {
      feedbackItems.testCoverage = { passed: false, points: 0 };
    }

    // Time bonus (max 10 points)
    const timeUsed = selectedTime - timeRemaining;
    const timeEfficiency = Math.max(0, 10 - Math.floor(timeUsed / 600));
    totalScore += timeEfficiency;
    feedbackItems.timeEfficiency = { passed: timeEfficiency > 5, points: timeEfficiency };

    // Deduct for hints
    const hintPenalty = hintsUsed * 5;
    totalScore = Math.max(0, totalScore - hintPenalty);

    // Determine grade
    let finalGrade = '';
    if (totalScore >= 90) finalGrade = 'S';
    else if (totalScore >= 75) finalGrade = 'A';
    else if (totalScore >= 60) finalGrade = 'B';
    else if (totalScore >= 45) finalGrade = 'C';
    else finalGrade = 'D';

    setScore(totalScore);
    setGrade(finalGrade);
    setFeedback(feedbackItems);
    setScreen('results');
  };

  // Get hint
  const getHint = () => {
    const hints = [
      "Check the type of the pincode variable. Is it being compared as a string or number?",
      "Look at line 14: The || operator has unexpected behavior with falsy values like 0. Consider using ?? instead.",
      "The parseInt() function can help ensure numeric comparisons work correctly."
    ];
    
    if (hintsUsed < hints.length) {
      alert(`💡 Hint ${hintsUsed + 1}:\n\n${hints[hintsUsed]}`);
      setHintsUsed(prev => prev + 1);
    } else {
      alert('No more hints available!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {screen === 'landing' && (
        <LandingPage
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          startSimulation={startSimulation}
        />
      )}

      {screen === 'workspace' && (
        <Workspace
          timeRemaining={timeRemaining}
          formatTime={formatTime}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          scenario={scenario}
          code={code}
          setCode={setCode}
          testCode={testCode}
          setTestCode={setTestCode}
          hintsUsed={hintsUsed}
          getHint={getHint}
          evaluateSolution={evaluateSolution}
        />
      )}

      {screen === 'results' && (
        <ResultsPage
          score={score}
          grade={grade}
          feedback={feedback}
          timeUsed={selectedTime - timeRemaining}
          hintsUsed={hintsUsed}
          setScreen={setScreen}
        />
      )}
    </div>
  );
}

// Landing Page Component
function LandingPage({ selectedRole, setSelectedRole, selectedCompany, setSelectedCompany, selectedDifficulty, setSelectedDifficulty, selectedTime, setSelectedTime, startSimulation }) {
  const roles = ['Backend Developer (Node.js)', 'Frontend Developer (React)', 'Full Stack Developer', 'DevOps Engineer'];
  const companies = ['Swiggy', 'Zomato', 'Uber', 'Netflix', 'Startup'];
  const difficulties = ['Junior', 'Mid-Level', 'Senior'];
  const timeOptions = [
    { label: '1 Hour', value: 3600 },
    { label: '2 Hours', value: 7200 },
    { label: '3 Hours', value: 10800 }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)]">
      <div className="max-w-5xl w-full space-y-6 animate-fadeIn">
        <div className="rounded-3xl border border-slate-700 bg-slate-800/70 backdrop-blur-md p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
                Student Practice Hub
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-100">
                Prepare for your next opportunity
              </h1>
              <p className="text-slate-400 max-w-2xl">
                Practice realistic engineering tasks in a calm, guided workspace before interviews and hiring rounds.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-400 min-w-[220px]">
              <div className="font-semibold text-slate-200">Current challenge</div>
              <div className="mt-1 text-cyan-400">{selectedRole}</div>
              <div className="mt-1">{selectedCompany} • {selectedDifficulty}</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 space-y-6 shadow-lg shadow-slate-950/40">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Time Limit</label>
            <div className="grid grid-cols-3 gap-3">
              {timeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTime(option.value)}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedTime === option.value
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={startSimulation}
          className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-[1.01]"
        >
          ▶ Start Practice Session
        </button>
      </div>
    </div>
  );
}

// Workspace Component
function Workspace({ timeRemaining, formatTime, isPaused, setIsPaused, currentTab, setCurrentTab, scenario, code, setCode, testCode, setTestCode, hintsUsed, getHint, evaluateSolution }) {
  const [activeFile, setActiveFile] = useState('menu_utils.js');
  
  const getTimerColor = () => {
    if (timeRemaining < 600) return 'text-red-500';
    if (timeRemaining < 1800) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-200">TrueHire Workspace</h2>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{scenario.jiraTicket.id}: {scenario.jiraTicket.title}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={`flex items-center gap-2 font-mono text-lg font-bold ${getTimerColor()}`}>
            <span>⏱</span>
            <span>{formatTime(timeRemaining)}</span>
          </div>
          
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          
          <button
            onClick={getHint}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            💡 Hint ({3 - hintsUsed} left)
          </button>
          
          <button
            onClick={evaluateSolution}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all"
          >
            Submit Solution
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tabs */}
        <div className="w-2/5 border-r border-slate-700 flex flex-col">
          {/* Tab Headers */}
          <div className="bg-slate-800 border-b border-slate-700 flex">
            {['jira', 'slack', 'docs'].map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`flex-1 px-6 py-3 font-medium transition-colors ${
                  currentTab === tab
                    ? 'bg-slate-900 text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {tab === 'jira' ? '📋 Jira' : tab === 'slack' ? '💬 Slack' : '📚 Docs'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-6 bg-slate-900">
            {currentTab === 'jira' && <JiraBoard ticket={scenario.jiraTicket} />}
            {currentTab === 'slack' && <SlackSimulator channels={scenario.slackChannels} />}
            {currentTab === 'docs' && <Documentation />}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col bg-slate-900">
          {/* File Tabs */}
          <div className="bg-slate-800 border-b border-slate-700 flex gap-2 px-4 py-2">
            <button
              onClick={() => setActiveFile('menu_utils.js')}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeFile === 'menu_utils.js'
                  ? 'bg-slate-900 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              menu_utils.js
            </button>
            <button
              onClick={() => setActiveFile('menu_utils.test.js')}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeFile === 'menu_utils.test.js'
                  ? 'bg-slate-900 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              menu_utils.test.js
            </button>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-auto">
            <textarea
              value={activeFile === 'menu_utils.js' ? code : testCode}
              onChange={(e) => activeFile === 'menu_utils.js' ? setCode(e.target.value) : setTestCode(e.target.value)}
              className="w-full h-full bg-slate-900 text-slate-200 p-6 font-mono text-sm resize-none focus:outline-none"
              style={{ fontFamily: '"Fira Code", monospace', tabSize: 2 }}
              spellCheck={false}
            />
          </div>

          {/* Console */}
          <div className="h-32 bg-black border-t border-slate-700 p-4 overflow-auto">
            <div className="text-slate-500 text-sm font-mono">
              <div className="text-green-500">$ Ready to test...</div>
              <div className="text-slate-600 mt-1">// Click "Submit Solution" to evaluate your code</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Jira Board Component
function JiraBoard({ ticket }) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg p-6 border-l-4 border-red-500">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">{ticket.priority}</span>
              <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">{ticket.id}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-200">{ticket.title}</h3>
          </div>
        </div>
        
        <p className="text-slate-400 mb-4">{ticket.description}</p>
        
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-semibold text-slate-300">Acceptance Criteria:</h4>
          <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
            {ticket.acceptanceCriteria.map((criteria, idx) => (
              <li key={idx}>{criteria}</li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-3 border-t border-slate-700 pt-4">
          <h4 className="text-sm font-semibold text-slate-300">Comments:</h4>
          {ticket.comments.map((comment, idx) => (
            <div key={idx} className="bg-slate-900 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {comment.author.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-sm font-medium text-slate-300">{comment.author}</span>
                <span className="text-xs text-slate-500">{comment.time}</span>
              </div>
              <p className="text-sm text-slate-400 pl-8">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Slack Simulator Component
function SlackSimulator({ channels }) {
  const [activeChannel, setActiveChannel] = useState('incidents');
  
  return (
    <div className="space-y-4">
      {/* Channel selector */}
      <div className="flex gap-2">
        {Object.keys(channels).map(channel => (
          <button
            key={channel}
            onClick={() => setActiveChannel(channel)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeChannel === channel
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            #{channel}
          </button>
        ))}
      </div>
      
      {/* Messages */}
      <div className="space-y-3">
        {channels[activeChannel].map((msg, idx) => (
          <div key={idx} className="bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                {msg.from.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-slate-200">{msg.from}</span>
                  <span className="text-xs text-slate-500">{msg.time}</span>
                </div>
                <p className="text-slate-300">{msg.message}</p>
                {msg.reactions && (
                  <div className="flex gap-2 mt-2">
                    {msg.reactions.map((reaction, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs">{reaction}</span>
                    ))}
                  </div>
                )}
                {msg.thread && (
                  <button className="text-xs text-blue-400 hover:underline mt-2">
                    {msg.thread} replies →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Documentation Component
function Documentation() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-slate-200">Restaurant Service API</h2>
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-300">Overview</h3>
          <p className="text-slate-400">
            The restaurant service handles menu retrieval, restaurant details, and location-based availability checks.
          </p>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-300">Key Functions</h3>
          <div className="bg-slate-900 rounded p-4 font-mono text-sm">
            <div className="text-green-400">getRestaurantMenu(restaurantId, pincode)</div>
            <div className="text-slate-500 ml-4">Fetches menu items for a restaurant at a given location</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-300">Environment Variables</h3>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li><code className="text-blue-400">MIN_PINCODE</code>: Minimum serviceable pincode (default: 400000)</li>
            <li><code className="text-blue-400">MAX_PINCODE</code>: Maximum serviceable pincode (default: 600000)</li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-300">Common Issues</h3>
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded p-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ Remember: JavaScript string comparisons can be tricky! "560001" &gt; "600000" evaluates differently than you might expect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Results Page Component
function ResultsPage({ score, grade, feedback, timeUsed, hintsUsed, setScreen }) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getGradeColor = () => {
    if (grade === 'S' || grade === 'A') return 'from-green-500 to-emerald-500';
    if (grade === 'B') return 'from-blue-500 to-cyan-500';
    if (grade === 'C') return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getSeniorityLevel = () => {
    if (score >= 90) return 'Senior Developer';
    if (score >= 75) return 'Mid-Level Developer';
    return 'Junior Developer';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-slate-200">Simulation Complete!</h1>
          <p className="text-slate-400">Here's how you performed</p>
        </div>

        {/* Score Display */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700 text-center space-y-6">
          <div className={`inline-block text-8xl font-black bg-gradient-to-r ${getGradeColor()} bg-clip-text text-transparent`}>
            {grade}
          </div>
          <div className="text-6xl font-bold text-slate-200">{score}/100</div>
          <div className="text-2xl font-semibold text-blue-400">{getSeniorityLevel()}</div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-2">Time Taken</div>
            <div className="text-3xl font-bold text-slate-200">{formatTime(timeUsed)}</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-2">Hints Used</div>
            <div className="text-3xl font-bold text-slate-200">{hintsUsed}</div>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="bg-slate-800 rounded-2xl p-8 space-y-6">
          <h3 className="text-2xl font-bold text-slate-200 mb-6">Detailed Breakdown</h3>
          
          {Object.entries(feedback).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">
                  {key === 'nullishCoalescing' && 'Nullish Coalescing Operator (??  vs ||)'}
                  {key === 'typeCoercion' && 'Type Coercion Fix (parseInt)'}
                  {key === 'edgeCases' && 'Empty Menu Edge Case Handling'}
                  {key === 'errorHandling' && 'Proper Error Handling'}
                  {key === 'testCoverage' && 'Test Case Coverage (3+ tests)'}
                  {key === 'timeEfficiency' && 'Time Efficiency'}
                </span>
                <span className={`font-bold ${value.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {value.points} pts
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${value.passed ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${(value.points / 25) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Text */}
        <div className="bg-slate-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-slate-200 mb-4">Feedback</h3>
          <div className="space-y-3 text-slate-300">
            {score >= 75 && (
              <p className="text-green-400">
                ✅ <strong>Excellent work!</strong> You identified and fixed the critical type coercion bugs. Your approach to debugging was systematic and thorough.
              </p>
            )}
            {score >= 45 && score < 75 && (
              <p className="text-blue-400">
                👍 <strong>Good effort!</strong> You caught some of the bugs, but there's room for improvement in edge case handling and test coverage.
              </p>
            )}
            {score < 45 && (
              <p className="text-yellow-400">
                ⚠️ <strong>Keep practicing!</strong> Focus on understanding JavaScript type coercion and the differences between comparison operators.
              </p>
            )}
            
            <p className="text-slate-400">
              <strong>Key Takeaways:</strong> This scenario tested your understanding of JavaScript type coercion, 
              the nullish coalescing operator (??), and defensive programming practices. In production code, 
              always validate input types and handle edge cases explicitly.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setScreen('landing')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all"
          >
            Try Another Scenario
          </button>
          <button
            onClick={() => window.print()}
            className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl transition-colors"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainApp;