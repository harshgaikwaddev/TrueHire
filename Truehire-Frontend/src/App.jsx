/**
 * Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.
 *
 * App.jsx
 * 
 * Enterprise-grade User Interface for TrueHire platform.
 * Features Candidate Dashboard, Employer Candidate Tracking System,
 * and Code Practice Hub with clean, modern, professional typography.
 */

import React, { useEffect, useState } from "react";
import PracticeHub from "./components/PracticeHub/PracticeHub";

// Initial realistic opportunities to showcase full platform capability
const INITIAL_JOBS = [
  {
    id: 1,
    title: "Junior Full Stack Developer",
    company: "Swiggy",
    location: "Bangalore (Hybrid)",
    description: "Build robust APIs and responsive client-side features for our hyper-local delivery logistics platform. Experience with Node.js and React preferred."
  },
  {
    id: 2,
    title: "Software Engineer - Backend",
    company: "Razorpay",
    location: "Remote",
    description: "Design and scale high-throughput payment processing pipelines. Strong foundations in algorithms, data structures, and distributed systems."
  },
  {
    id: 3,
    title: "Frontend Engineering Intern",
    company: "Zerodha",
    location: "Bangalore",
    description: "Craft pixel-perfect, accessible, and ultra-fast user interfaces for next-generation fintech products using modern JavaScript and React."
  }
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const JOBS_API = `${API_BASE}/api/jobs`;

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [applications, setApplications] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    const deletedJobIds = JSON.parse(localStorage.getItem("deletedDefaultJobIds") || "[]");

    fetch(JOBS_API)
      .then((res) => (res.ok ? res.json() : []))
      .then((savedJobs) => {
        setJobs([
          ...savedJobs,
          ...INITIAL_JOBS.filter((job) => !deletedJobIds.includes(job.id)),
        ]);
      })
      .catch(() => {
        setJobs(INITIAL_JOBS.filter((job) => !deletedJobIds.includes(job.id)));
      });
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUser(parsedUser);
      } catch (_) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server error. Please ensure the backend is running on port 5000.");
    }
  };

  const handleRegister = async () => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.message) {
        setError("");
        setTimeout(() => {
          setIsLogin(true);
          setForm({ name: "", email: "", password: "", role: "student" });
        }, 1500);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Server error. Please ensure the backend is running on port 5000.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, { method: "POST" });
    } catch (err) {
      console.log(err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUser(null);
      setForm({ name: "", email: "", password: "", role: "student" });
      setError("");
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();

    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.description) {
      return;
    }

    const token = localStorage.getItem("token");
    let res;
    let data;
    try {
      res = await fetch(JOBS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobForm),
      });
      data = await res.json();
    } catch (err) {
      setError("Unable to reach the jobs service");
      return;
    }

    if (!res.ok) {
      setError(data.error || "Unable to publish job");
      return;
    }

    setJobs((prevJobs) => [data, ...prevJobs]);
    setJobForm({ title: "", company: "", location: "", description: "" });
  };

  const handleDeleteJob = async (jobId) => {
    if (typeof jobId === "string") {
      let res;
      try {
        res = await fetch(`${JOBS_API}/${jobId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } catch (err) {
        setError("Unable to reach the jobs service");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Unable to delete job");
        return;
      }
    } else {
      const deletedJobIds = JSON.parse(localStorage.getItem("deletedDefaultJobIds") || "[]");
      localStorage.setItem("deletedDefaultJobIds", JSON.stringify([...deletedJobIds, jobId]));
    }

    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
    setApplications((prevApps) => prevApps.filter((app) => app.jobId !== jobId));
  };

  const handleApplyToJob = (jobId) => {
    const existingApplication = applications.find((app) => app.jobId === jobId);
    if (existingApplication) {
      return;
    }

    const selectedJob = jobs.find((job) => job.id === jobId);
    if (!selectedJob) {
      return;
    }

    setApplications((prev) => [
      ...prev,
      {
        id: Date.now(),
        jobId,
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        applicantName: user?.name || "Candidate",
        applicantEmail: user?.email || "",
        status: "Applied",
        interviewDate: "",
        interviewNote: "",
      },
    ]);
  };

  const handleUpdateApplicantStatus = (applicationId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );
  };

  const handleUpdateApplicantDetails = (applicationId, field, value) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, [field]: value } : app
      )
    );
  };

  // Logged-in Router View
  if (isLoggedIn) {
    if (user?.role === "recruiter") {
      return (
        <RecruiterDashboard
          user={user}
          handleLogout={handleLogout}
          jobs={jobs}
          handleCreateJob={handleCreateJob}
          handleDeleteJob={handleDeleteJob}
          jobForm={jobForm}
          setJobForm={setJobForm}
          applications={applications}
          handleUpdateApplicantStatus={handleUpdateApplicantStatus}
          handleUpdateApplicantDetails={handleUpdateApplicantDetails}
        />
      );
    }

    return (
      <StudentDashboard
        user={user}
        handleLogout={handleLogout}
        jobs={jobs}
        applications={applications}
        handleApplyToJob={handleApplyToJob}
      />
    );
  }

  // Professional Authentication Screen
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-white">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Header Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-600 text-white font-bold text-lg mb-3 shadow-md shadow-cyan-600/20">
              TH
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              TrueHire
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-medium">
              {isLogin ? "Sign in to access your dashboard" : "Create your account on the hiring platform"}
            </p>
          </div>

          {/* Role selector toggle for register */}
          {!isLogin && (
            <div className="mb-5 bg-slate-950 p-1 rounded-xl border border-slate-800 flex">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "student" })}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  form.role === "student"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "recruiter" })}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  form.role === "recruiter"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Recruiter
              </button>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <button
              onClick={isLogin ? handleLogin : handleRegister}
              className="w-full mt-2 py-2.5 px-4 rounded-lg font-semibold text-sm text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-sm"
            >
              {isLogin ? "Sign In" : "Register"}
            </button>
          </div>

          {/* Switch Login/Register */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">
              {isLogin ? "Need an account?" : "Already registered?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold ml-1 transition-colors"
              >
                {isLogin ? "Register" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
      <CopyrightFooter />
    </div>
  );
}

function CopyrightFooter() {
  return (
    <footer className="w-full max-w-7xl mt-6 px-4 text-center text-[11px] leading-relaxed text-slate-500">
      Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.
    </footer>
  );
}

/**
 * Universal Navigation Bar for Authenticated Views
 */
function Navbar({ user, handleLogout }) {
  const isRecruiter = user?.role === "recruiter";
  const userInitials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold text-xs tracking-wider">
            TH
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">
              TrueHire
            </span>
            <span className="ml-2.5 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border bg-slate-950 text-slate-400 border-slate-800">
              {isRecruiter ? "Employer Portal" : "Candidate Portal"}
            </span>
          </div>
        </div>

        {/* User Identity & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-800">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
              isRecruiter ? "bg-indigo-600" : "bg-cyan-600"
            }`}>
              {userInitials}
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-semibold text-slate-200">{user?.name || "User"}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.role || "student"}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * =========================================================================
 * STUDENT DASHBOARD
 * =========================================================================
 */
function StudentDashboard({ user, handleLogout, jobs, applications, handleApplyToJob }) {
  const [activeSection, setActiveSection] = useState("practice");

  const interviewCount = applications.filter((app) => app.status === "Interview Scheduled").length;
  const acceptedCount = applications.filter((app) => app.status === "Accepted").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Navbar user={user} handleLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Header & High-Level Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Candidate Workspace
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Welcome back, {user?.name || "Candidate"}
              </h1>
              <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
                Complete technical coding assessments, track application stages, and discover open roles.
              </p>
            </div>

            {/* Metric Counters */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center min-w-[95px]">
                <div className="text-xl font-bold text-cyan-400">{applications.length}</div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">Applied</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center min-w-[95px]">
                <div className="text-xl font-bold text-amber-400">{interviewCount}</div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">Interviews</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center min-w-[95px]">
                <div className="text-xl font-bold text-emerald-400">{acceptedCount}</div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">Offers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-fit">
          {[
            { id: "practice", label: "Coding Practice", badge: "15 Problems" },
            { id: "opportunities", label: "Job Opportunities", badge: jobs.length },
            { id: "applications", label: "Application Tracker", badge: applications.length },
            { id: "profile", label: "Profile" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeSection === tab.id
                  ? "bg-cyan-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                  activeSection === tab.id
                    ? "bg-cyan-700 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: CODING PRACTICE ARENA */}
        {activeSection === "practice" && (
          <div className="w-full">
            <PracticeHub />
          </div>
        )}

        {/* TAB 2: OPPORTUNITIES EXPLORER */}
        {activeSection === "opportunities" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div>
                <h3 className="text-base font-semibold text-white">Active Positions</h3>
                <p className="text-xs text-slate-400">
                  Open engineering roles posted by partner organizations.
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-slate-300">
                {jobs.length} Positions Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
                  <p className="text-sm font-medium">No open positions available at this time.</p>
                </div>
              ) : (
                jobs.map((job) => {
                  const hasApplied = applications.some((app) => app.jobId === job.id);

                  return (
                    <div
                      key={job.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
                              {job.company}
                            </span>
                            <h4 className="text-sm font-semibold text-white mt-0.5">{job.title}</h4>
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 font-medium">
                          {job.location}
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                          {job.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-500">ID #{job.id}</span>
                        <button
                          onClick={() => handleApplyToJob(job.id)}
                          disabled={hasApplied}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            hasApplied
                              ? "bg-slate-800 text-slate-500 cursor-default"
                              : "bg-cyan-600 hover:bg-cyan-500 text-white"
                          }`}
                        >
                          {hasApplied ? "Applied" : "Apply"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: APPLICATION STATUS TRACKER */}
        {activeSection === "applications" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <h3 className="text-base font-semibold text-white">Application Status</h3>
              <p className="text-xs text-slate-400">
                Track your recruitment progress across review, interview, and offer stages.
              </p>
            </div>

            {applications.length === 0 ? (
              <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
                <p className="text-sm font-medium">No submitted applications.</p>
                <p className="text-xs mt-1">Visit the Job Opportunities section to view open positions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const getStatusBadge = (status) => {
                    switch (status) {
                      case "Accepted":
                        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                      case "Rejected":
                        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
                      case "Interview Scheduled":
                        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
                      case "Shortlisted":
                        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
                      default:
                        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
                    }
                  };

                  return (
                    <div
                      key={app.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                        <div>
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                            {app.company}
                          </span>
                          <h4 className="text-base font-semibold text-white">{app.jobTitle}</h4>
                        </div>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border self-start sm:self-auto ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </div>

                      {/* Timeline Stages */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium">
                        <div className="bg-slate-950 p-2 rounded-lg border border-cyan-500/30 text-cyan-400">
                          Applied
                        </div>
                        <div className={`p-2 rounded-lg border ${
                          app.status === "Reviewed" || app.status === "Shortlisted" || app.status === "Interview Scheduled" || app.status === "Accepted"
                            ? "bg-slate-950 border-cyan-500/30 text-cyan-400"
                            : "bg-slate-950 border-slate-800 text-slate-600"
                        }`}>
                          Reviewed
                        </div>
                        <div className={`p-2 rounded-lg border ${
                          app.status === "Shortlisted" || app.status === "Interview Scheduled" || app.status === "Accepted"
                            ? "bg-slate-950 border-amber-500/30 text-amber-400"
                            : "bg-slate-950 border-slate-800 text-slate-600"
                        }`}>
                          Shortlisted
                        </div>
                        <div className={`p-2 rounded-lg border ${
                          app.status === "Accepted"
                            ? "bg-slate-950 border-emerald-500/30 text-emerald-400"
                            : app.status === "Rejected"
                            ? "bg-slate-950 border-rose-500/30 text-rose-400"
                            : "bg-slate-950 border-slate-800 text-slate-600"
                        }`}>
                          Decision
                        </div>
                      </div>

                      {/* Scheduled Interview Details */}
                      {(app.interviewDate || app.interviewNote) && (
                        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1 text-xs">
                          {app.interviewDate && (
                            <div className="text-slate-300">
                              <span className="text-amber-400 font-semibold">Interview Schedule: </span>
                              <span className="font-mono">{app.interviewDate}</span>
                            </div>
                          )}
                          {app.interviewNote && (
                            <div className="text-slate-400">
                              <span className="font-semibold text-slate-300">Notes: </span>
                              {app.interviewNote}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Final Decisions */}
                      {app.status === "Accepted" && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium">
                          Application Accepted: An offer has been formally extended for this position.
                        </div>
                      )}
                      {app.status === "Rejected" && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-medium">
                          Application Decision: Not selected for the current cohort.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CANDIDATE PROFILE */}
        {activeSection === "profile" && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center text-lg font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "C"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{user?.name || "Candidate"}</h3>
                  <div className="text-xs text-slate-400">{user?.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase font-semibold text-[10px]">Account Role</span>
                  <div className="font-semibold text-slate-200 capitalize">{user?.role || "student"}</div>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase font-semibold text-[10px]">Assessment Status</span>
                  <div className="font-semibold text-emerald-400">Active Candidate</div>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                Registered candidate on the TrueHire evaluation network. Access the Coding Practice section to solve technical problems in an isolated execution sandbox.
              </div>
            </div>
          </div>
        )}
      </main>
      <CopyrightFooter />
    </div>
  );
}

/**
 * =========================================================================
 * RECRUITER DASHBOARD
 * =========================================================================
 */
function RecruiterDashboard({
  user,
  handleLogout,
  jobs,
  handleCreateJob,
  handleDeleteJob,
  jobForm,
  setJobForm,
  applications,
  handleUpdateApplicantStatus,
  handleUpdateApplicantDetails,
}) {
  const [activeSection, setActiveSection] = useState("jobs");

  const shortlistedCount = applications.filter(
    (app) => app.status === "Shortlisted" || app.status === "Interview Scheduled" || app.status === "Accepted"
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar user={user} handleLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Recruiter Overview Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Employer Console
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Recruitment Dashboard
              </h1>
              <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
                Manage position listings, review candidate submissions, and update hiring pipeline decisions.
              </p>
            </div>

            {/* Recruiter Metric Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center min-w-[95px]">
                <div className="text-xl font-bold text-indigo-400">{jobs.length}</div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">Listings</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center min-w-[95px]">
                <div className="text-xl font-bold text-cyan-400">{applications.length}</div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">Candidates</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center min-w-[95px]">
                <div className="text-xl font-bold text-emerald-400">{shortlistedCount}</div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">In Pipeline</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-fit">
          <button
            onClick={() => setActiveSection("jobs")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSection === "jobs"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <span>Job Listings & Form</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {jobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection("candidates")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSection === "candidates"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <span>Candidate Pipeline</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection("profile")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSection === "profile"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Organization Profile
          </button>
        </div>

        {/* SECTION 1: JOB LISTINGS & POST FORM */}
        {activeSection === "jobs" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Post Position (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Post an Opportunity</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Positions will appear instantly on candidate dashboards.
                  </p>
                </div>

                <form onSubmit={handleCreateJob} className="space-y-3 text-xs font-medium">
                  <div>
                    <label className="block text-slate-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Backend Software Engineer"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corporation"
                      value={jobForm.company}
                      onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Location / Work Mode</label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore, India (Remote Available)"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Role Description</label>
                    <textarea
                      rows={4}
                      placeholder="Specify technical stack, requirements, and responsibilities..."
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                  >
                    Publish Opportunity
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Active Listings (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-base font-semibold text-white">Active Postings</h3>
                <span className="text-xs text-slate-400">{jobs.length} Listings</span>
              </div>

              {jobs.length === 0 ? (
                <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
                  <p className="text-sm font-medium">No published jobs.</p>
                  <p className="text-xs mt-1">Use the form to create your first listing.</p>
                </div>
              ) : (
                jobs.map((job) => {
                  const jobApplications = applications.filter((app) => app.jobId === job.id);

                  return (
                    <div
                      key={job.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                            {job.company}
                          </span>
                          <h4 className="text-sm font-semibold text-white mt-0.5">{job.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">
                            {jobApplications.length} Applicants
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-xs px-2.5 py-0.5 rounded border border-rose-900 text-rose-300 hover:bg-rose-950 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 font-medium">
                        {job.location}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        {job.description}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: CANDIDATE PIPELINE */}
        {activeSection === "candidates" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Candidate Review</h3>
                <p className="text-xs text-slate-400">
                  Update candidate stages, schedule interviews, and add evaluation notes.
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300">
                {applications.length} Submissions
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
                <p className="text-sm font-medium">No candidates have applied yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{app.applicantName}</h4>
                          <div className="text-xs text-slate-400 font-mono">{app.applicantEmail}</div>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400">
                          {app.status}
                        </span>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <div className="text-slate-400">
                          <span className="font-semibold text-slate-300">Position: </span>
                          {app.jobTitle} ({app.company})
                        </div>
                      </div>

                      {/* Recruiter Action Controls */}
                      <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                        <label className="block font-medium text-slate-300">Pipeline Status</label>
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                        >
                          <option value="Applied">Applied (Initial Intake)</option>
                          <option value="Reviewed">Reviewed (Profile Passed)</option>
                          <option value="Shortlisted">Shortlisted for Assessment</option>
                          <option value="Interview Scheduled">Interview Scheduled</option>
                          <option value="Accepted">Accepted (Offer Extended)</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        <div className="space-y-2 pt-1">
                          <div>
                            <label className="block font-medium text-slate-400 text-[11px] mb-1">
                              Interview Schedule
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Sept 10, 2026 at 3:00 PM IST"
                              value={app.interviewDate || ""}
                              onChange={(e) =>
                                handleUpdateApplicantDetails(app.id, "interviewDate", e.target.value)
                              }
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block font-medium text-slate-400 text-[11px] mb-1">
                              Evaluation Note
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Completed technical round..."
                              value={app.interviewNote || ""}
                              onChange={(e) =>
                                handleUpdateApplicantDetails(app.id, "interviewNote", e.target.value)
                              }
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Final decision label */}
                    {(app.status === "Accepted" || app.status === "Rejected") && (
                      <div className={`mt-2 p-2 rounded-lg text-xs font-medium text-center border ${
                        app.status === "Accepted"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}>
                        {app.status === "Accepted" ? "Offer Formally Extended" : "Candidate Not Selected"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: RECRUITER PROFILE */}
        {activeSection === "profile" && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-base font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "E"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{user?.name || "Recruiter"}</h3>
                  <div className="text-xs text-slate-400">{user?.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase font-semibold text-[10px]">Account Type</span>
                  <div className="font-semibold text-slate-200 capitalize">{user?.role || "recruiter"}</div>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase font-semibold text-[10px]">Privileges</span>
                  <div className="font-semibold text-emerald-400">Position Posting & Review</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <CopyrightFooter />
    </div>
  );
}

export default App;