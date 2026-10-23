# TrueHire - Job Simulation Platform

## Overview
An AI-powered platform that tests job candidates through realistic work scenarios instead of traditional whiteboard interviews.

## Features
- 🎯 Role-specific scenarios (Backend, Frontend, Full Stack, DevOps)
- 💻 In-browser code editor
- 📋 Simulated Jira board with realistic tickets
- 💬 Fake Slack messages for context
- ⏱️ Timed challenges with difficulty levels
- 📊 Intelligent evaluation and seniority scoring

## Tech Stack
- **Frontend:** React 18, Tailwind CSS
- **Build Tool:** Vite
- **State Management:** React Hooks

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd truehire
```

2. Install dependencies
```bash
npm install
```

3. Run development server
```bash
npm run dev
```

4. Open browser
```
http://localhost:5173
```

## Project Structure
```
truehire/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles with Tailwind
├── public/              # Static assets
└── index.html           # HTML template
```

## Current Status
- ✅ Phase 1: Frontend Development (Complete)
- 🔄 Phase 2: Backend Integration (Planned)
- ⏳ Phase 3: AI Evaluation System (Planned)

## Roadmap
- [ ] Add real Monaco Editor for code editing
- [ ] Integrate Supabase for data persistence
- [ ] Add Google Gemini API for intelligent evaluation
- [ ] Deploy to Vercel
- [ ] Add more scenarios (Frontend, DevOps, Full Stack)
- [ ] User authentication and progress tracking

## Author
Harsh Gaikwad - Final Year Project

## Copyright and Ownership

Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.

The original work in this project is owned by **Harsh Gaikwad**, subject to
applicable law and any third-party components, dependencies, or existing
licenses. This notice does not remove or override the licenses or attribution
requirements of third-party software included in or used by the project.

## License

This project is licensed under the [MIT License](../LICENSE).

Copyright (c) 2026 - Harsh Satish Gaikwad

The MIT License applies to the original TrueHire project code. Third-party
components and dependencies remain subject to their own licenses and
attribution requirements.