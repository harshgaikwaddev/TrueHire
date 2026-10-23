/**
 * Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.
 *
 * QuestionList.jsx
 * 
 * Lists all practice questions fetched from /api/questions.
 * Clean, professional typography without informal emojis.
 */

import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function QuestionList({ onSelectQuestion }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/questions`);
        if (!res.ok) {
          throw new Error(`Failed to load questions (status ${res.status})`);
        }
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message || 'Error fetching question bank');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  // Filter questions based on search query & difficulty
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === 'ALL' || q.difficulty.toUpperCase() === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyBadge = (difficulty) => {
    const diff = (difficulty || '').toLowerCase();
    if (diff === 'easy') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    }
    if (diff === 'medium') {
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    }
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              Assessment Arena
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Engineering Coding Challenges
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-xl leading-relaxed">
              Solve algorithmic challenges, test with custom inputs, and submit solutions against automated test suites.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center min-w-[90px]">
              <div className="text-xl font-bold text-cyan-400">{questions.length}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Challenges</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center min-w-[90px]">
              <div className="text-xl font-bold text-emerald-400">3</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Languages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search problems by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex gap-1.5 self-start sm:self-auto">
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                difficultyFilter === diff
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse space-y-3">
              <div className="h-4 bg-slate-800 rounded w-1/3"></div>
              <div className="h-3 bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {!loading && error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-center space-y-2">
          <p className="text-xs font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded border border-rose-500/40 text-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Question Cards Grid */}
      {!loading && !error && filteredQuestions.length === 0 && (
        <div className="text-center py-12 text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-xs font-medium">No challenges match your filter criteria.</p>
          <button
            onClick={() => {
              setSearch('');
              setDifficultyFilter('ALL');
            }}
            className="mt-2 text-xs text-cyan-400 hover:underline"
          >
            Reset filters
          </button>
        </div>
      )}

      {!loading && !error && filteredQuestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q.id)}
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-100 group-hover:text-cyan-300 text-sm transition-colors">
                    {q.title}
                  </h3>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getDifficultyBadge(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                </div>
                <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                  {q.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">ID: {q.id}</span>
                <span className="font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                  Open Challenge
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
