# ATS Optimizer 🎯

An AI-powered full stack web application that helps job seekers beat Applicant Tracking Systems (ATS) by analyzing their resume against job descriptions and providing actionable improvement suggestions.

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

---

## 🤔 The Problem

When you apply for a job online, your resume doesn't go directly to a human. It first passes through an **ATS (Applicant Tracking System)** — a software that scans resumes like a robot, looking for specific keywords from the job description.

If your resume doesn't contain those exact keywords — even if you're perfectly qualified — it gets **automatically rejected** before any human sees it.

**Example:**

- Job says: _"Looking for a developer with REST APIs and JWT authentication"_
- Your resume says: _"Built backend systems with secure login"_
- ATS score: ❌ 40% match → Auto rejected
- Fix it to: _"Built REST APIs with JWT authentication"_ → ✅ 85% match → Passes through

Same person. Same skills. Different words. Completely different outcome.

---

## ✨ How It Works

```
1. Upload Resume (PDF or DOCX)
         ↓
2. Paste Job Description
         ↓
3. AI Analyzes Both (Groq LLaMA 3.3)
         ↓
4. Get Match Score + Missing Keywords + Suggestions
         ↓
5. Fix Resume → Re-analyze → Apply with Confidence
```

---

## 🚀 Features

- 🔐 **Authentication** — Secure register/login with JWT
- 📄 **Resume Upload** — Supports PDF and DOCX formats
- 🤖 **AI Analysis** — Powered by Groq LLaMA 3.3 70B
- 🎯 **Match Score** — See exactly how well your resume matches the job
- ❌ **Missing Keywords** — Find what ATS is looking for but can't find
- ✅ **Present Keywords** — See what you already have
- 💡 **Improvement Suggestions** — AI rewrites your bullet points to match
- ⚠️ **Formatting Issues** — Catch formatting problems that hurt ATS scores
- ✍️ **Cover Letter Generator** — AI generates a tailored cover letter
- 📥 **Export to PDF** — Download your full analysis report
- 📋 **History** — View and manage all your previous analyses
- 🌙 **Dark / Light Mode** — Comfortable viewing in any environment
- ⚡ **Credit System** — 10 free analyses per account

---

## 🛠️ Tech Stack

### Frontend

- React.js + Vite
- React Router v6
- Axios
- React Toastify
- jsPDF (PDF export)
- React Icons

### Backend

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt password hashing
- Multer (file uploads)
- pdfjs-dist (PDF parsing)
- Mammoth (DOCX parsing)
- Groq SDK (AI integration)
- Express Rate Limiter

### AI

- Groq API — LLaMA 3.3 70B Versatile model

---

## 📸 Pages

| Page             | Description                                      |
| ---------------- | ------------------------------------------------ |
| Landing          | Introduction and entry point                     |
| Register / Login | Secure user authentication                       |
| Dashboard        | Upload resume + paste job description            |
| Results          | Match score, keywords, suggestions, cover letter |
| History          | All previous analyses with scores                |

---

## 🏗️ Project Structure

```
atsoptimizer/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute, ThemeToggle
│   │   ├── pages/           # Landing, Login, Register, Dashboard, Results, History
│   │   ├── context/         # AuthContext
│   │   ├── services/        # API calls (axios)
│   │   ├── styles/          # CSS files for each page
│   │   └── utils/
│   └── package.json
├── server/                  # Node + Express backend
│   ├── models/              # User.js, Resume.js
│   ├── routes/              # auth.js, resume.js
│   ├── controllers/         # authController.js, resumeController.js
│   ├── middleware/          # auth.js
│   ├── services/            # aiService.js, pdfService.js
│   └── server.js
├── package.json             # Root scripts (concurrently)
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Groq API key (free at console.groq.com)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/nikhil-lather/ats-optimizer.git
cd ats-optimizer
```

2. **Install all dependencies**

```bash
npm install
npm install --prefix server
npm install --prefix client
```

3. **Set up environment variables**

Create `.env` inside the `server` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
```

4. **Run the app**

```bash
npm run dev
```

Both frontend and backend start together!

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🔌 API Routes

```
📌 AUTH ROUTES
==============================================
METHOD   ROUTE                    ACTION
----------------------------------------------
POST     /api/auth/register       Register new user
POST     /api/auth/login          Login user
GET      /api/auth/me             Get logged in user (🔒 JWT)
==============================================

📌 RESUME ROUTES
==============================================
METHOD   ROUTE                    ACTION
----------------------------------------------
POST     /api/resume/analyze      Analyze resume (🔒 JWT + Multer)
POST     /api/resume/cover-letter Generate cover letter (🔒 JWT)
GET      /api/resume/history      Get all analyses (🔒 JWT)
GET      /api/resume/:id          Get single analysis (🔒 JWT)
DELETE   /api/resume/:id          Delete analysis (🔒 JWT)
==============================================
```

---

## 🌍 Deployment

Live: https://ats-optimizer.onrender.com

Deployed on **Render** — backend serves the frontend build in production.

---

## 👨‍💻 Author

**Nikhil Lather**

- GitHub: [@nikhil-lather](https://github.com/nikhil-lather)
- LinkedIn: [linkedin.com/in/nikhil-lather-3514272a9](https://linkedin.com/in/nikhil-lather-3514272a9)

---

Whenever you make changes:

git add .
git commit -m "describe my changes"
git push origin main
