# 🚀 TrueHire – Job Simulation Platform

A full-stack web application that simulates a real-world hiring system with user authentication, protected routes, and database integration.

---

## 📌 Overview

**TrueHire** is a job simulation platform built using the MERN stack (without React Router yet).
It allows users to **register, log in, and access secured routes**, similar to real hiring platforms.

This project demonstrates:

* Full-stack development
* Authentication using JWT
* Backend API development
* MongoDB database integration

---

## ✨ Features

* 🔐 User Registration
* 🔑 User Login Authentication
* 🪪 JWT Token Generation
* 🔒 Protected Route (`/profile`)
* 🌐 Full Stack Integration
* ⚡ Fast frontend using Vite + React

---

## 🛠 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Authentication

* JSON Web Token (JWT)

---

## 📁 Project Structure

```
True-Hire/
│
├── Truehire-Backend/
│   ├── models/
│   │   └── User.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│
├── Truehire-Frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── MainApp.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 🔧 Prerequisites

* Node.js installed
* MongoDB Atlas account

---

## 🚀 Step 1: Clone Repository

```
git clone https://github.com/harshgaikwad-05/True-Hire.git
cd True-Hire-Contents
```

---

## 🚀 Step 2: Run Backend

```
cd Truehire-Backend
npm install
node server.js
```

Server runs on:

```
http://localhost:5000
```

---

## 🚀 Step 3: Run Frontend

```
cd Truehire-Frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔐 API Endpoints

### 🟢 Register

```
POST /register
```

### 🔵 Login

```
POST /login
```

### 🔒 Protected Route

```
GET /profile
```

---

## 🧠 Authentication Flow

1. User registers or logs in
2. Backend verifies credentials
3. JWT token is generated
4. Token is stored in browser
5. Protected routes validate token before access

---

## ⚠️ Current Limitations

* Passwords are stored in plain text (⚠️ needs bcrypt)
* No logout system yet
* Basic UI (can be improved)

---

## 🚀 Future Enhancements

* 🔐 Password hashing (bcrypt)
* 🌐 Deployment (Vercel + Render)
* 🧠 AI interview simulation
* 📊 User dashboard
* 🔄 Logout functionality

---

## 👨‍💻 Author

**Harsh Gaikwad**

---

## Copyright and Ownership

Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.

The original work in this project is owned by **Harsh Gaikwad**, subject to
applicable law and any third-party components, dependencies, or existing
licenses. This notice does not remove or override the licenses or attribution
requirements of third-party software included in or used by the project.

---

## 📜 License

This project is for educational purposes.

---

🔥 Built as a Full Stack Final Year Project