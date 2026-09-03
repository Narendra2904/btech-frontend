# 🎓 Backbenchers — JNTUH B.Tech Results Portal & AI Academic Assistant

<p align="center">
  <img src="./assets/fav.png" alt="Backbenchers Logo" width="90" height="90" style="border-radius: 18px;" />
</p>

<p align="center">
  <strong>Fast. Free. Reliable. Intelligent JNTUH Academic Assistant built by students, for students.</strong>
</p>

<p align="center">
  <a href="https://btech-jntuh-results.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-btech--jntuh--results.vercel.app-gold?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Google%20Gemini-AI%20Assistant-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

---

## 🌟 Overview

**Backbenchers** is a modern, high-performance, dark-mode JNTUH B.Tech examination portal designed to eliminate the anxiety and slowness of official university portals.

Equipped with **Backbenchers AI**, the portal goes far beyond basic grade displays: it diagnoses active supplies, evaluates credit detention risks across **R16, R18, and R22** regulations, handles **Lateral Entry (6-semester)** academic constraints, predicts target CGPAs, audits grace marks eligibility, and curates instant Google lecture notes and YouTube video playlists for every subject.

---

## 🚀 Key Portal Features

| Page | URL Route | Description |
| :--- | :--- | :--- |
| 🏠 **Dashboard** | `/` (`index.html`) | Instant hall ticket search, quick services grid, and feature showcases. |
| 📊 **All Results** | `/result` (`result.html`) | Full academic vs semester-wise grade sheet with dynamic SGPA & CGPA calculation. |
| ⚠️ **Active Backlogs** | `/backlog` (`backlog.html`) | Root-cause analysis of uncleared supplies (internal vs external mark deficits). |
| 🛡️ **Credit Checker** | `/creditChecker` (`creditChecker.html`) | Complete credit audit and year-wise promotion vs detention status checker. |
| ⚡ **Live Results** | `/liveresults` (`liveresults.html`) | Instant live result fetcher for newly declared university examinations. |
| 👥 **Class Results** | `/classresult` (`classresult.html`) | Batch results explorer for entire classes and roll number ranges. |
| ⚖️ **Compare Results** | `/compare` (`compare.html`) | Side-by-side performance comparator between two students. |

---

## 🤖 Backbenchers AI Academic Assistant

A built-in client and server-assisted AI assistant accessible from a floating launcher on every page:

### 1. 🎓 Regulation-Aware CGPA & SGPA Engine
- Automatically parses the student's roll number to assign the correct JNTUH regulation:
  - **R22 Regulation**: Rolls starting with `22`, `23`, `24+` (Regular) & `23+` (Lateral Entry).
  - **R18 Regulation**: Rolls starting with `18` to `21` (Regular) & `19` to `22` (Lateral Entry).
  - **R16 Regulation**: Rolls starting with `16` and `17`.
- Computes accurate SGPA and cumulative CGPA factoring in regulation-specific grade points (`O`, `A+`, `A`, `B+`, `B`, `C`, `D`/`P`, `F`).

### 2. ⚡ Lateral Entry (`XXXX5AXXXX`) Intelligence
- Automatically detects **`5A`** (characters 5–6 of hall ticket) identifying Lateral Entry candidates.
- Adjusts degree requirements to strictly **6 semesters** (`2-1` through `4-2`) and **120 total credits** (instead of 160).
- Applies accurate Lateral Entry progression rules (50% credits in Year 2 to enter Year 3; 60% credits in Years 2+3 to enter Year 4).

### 3. 👤 Student First Name Formatting
- JNTUH records format names as `[SURNAME] [GIVEN NAME]` (e.g. `YENAGANDULA NARENDRA`).
- The assistant displays the candidate's actual **First Name** (`NARENDRA`) across all personalized greetings, context banners, and audits.

### 4. 📂 Direct Semester Result Navigation
- Type queries like *"Show 2-1"*, *"Navigate to 3-2"*, or *"Go to all semesters"* to smoothly jump to and render the requested semester on the result page.
- Interactive semester navigator card lists each semester's SGPA with a 1-click **`[View Result]`** trigger.

### 5. 🔍 Study Notes & YouTube Resource Hub
- Generates direct browser search links for every passed or pending subject:
  - 📄 **Google Notes & PDF Search**: Handwritten notes, previous question papers, and lecture materials.
  - 📺 **YouTube Video Playlists**: Unit-wise video tutorials.
  - 🇮🇳 **Telugu Lectures Search**: Easy-to-understand explanations in Telugu.
  - 💻 **Online Tutorials & References**: GeeksforGeeks and developer documentation.
  - 📚 **Backbenchers Notes Portal**: Curated notes from `https://btech-notes.vercel.app`.

### 6. 🛡️ Promotion & Credit Detention Guard
- Year-by-year credit tracking against JNTUH progression criteria:
  - 1st $\rightarrow$ 2nd Year: 50% credits of 1st year (~19–20 credits).
  - 2nd $\rightarrow$ 3rd Year: 60% credits up to 2nd year (~47–48 credits; 20 credits for Lateral).
  - 3rd $\rightarrow$ 4th Year: 60% credits up to 3rd year (~72–73 credits; 48 credits for Lateral).

### 7. 🎯 Target CGPA Solver
- Calculates exact SGPA needed per remaining semester to achieve goals like **7.5**, **8.0**, or **8.5** CGPA.
- Indicates mathematical feasibility and maximum achievable CGPA.

### 8. 📜 Grace Marks & Subject Exemption Scanner
- Audits failed theory subjects against the JNTUH **0.15% maximum grace marks rule** (~8–9 marks total).
- Verifies R18/R16 subject exemption eligibility ($\ge 154$ credits allows dropping up to 2 theory electives / 6 credits).

### 9. 💼 Placements & Career Readiness
- Evaluates student CGPA and backlog count against eligibility criteria for **Mass IT Recruiters** (TCS, Infosys, Wipro), **Tier-1/Product Companies**, and **Higher Studies/GATE**.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Tailwind CSS, FontAwesome 6.4, Custom CSS Animations.
- **Backend**: Node.js, Express.js (Clean URL routing, static file serving, proxy handling).
- **AI Integration**: Google Gemini 1.5 Flash (`@google/genai` API proxy).
- **Communication**: Twilio WhatsApp API (Instant user feedback notification).
- **Deployment**: Vercel (Frontend & Serverless Functions) + Render (API / Node backend).

---

## 💻 Local Development & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Git

### 2. Clone the Repository
```bash
git clone https://github.com/Narendra2904/btech-frontend.git
cd btech-frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Edit `.env` with your credentials:
```env
PORT=3000

# Optional: Google Gemini API key for AI explanations
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Twilio WhatsApp feedback alerts
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
MY_NUMBER=your_whatsapp_number
```

### 5. Run the Application
```bash
# Start server
npm start

# Or with live restart (using nodemon if installed)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Repository Structure

```
btech-frontend/
├── assets/                    # Favicons, logos, and graphic assets
├── api/
│   └── chat-ai.js             # Serverless AI handler for Vercel
├── ai-bot.js                  # Backbenchers AI core engine & dialog manager
├── ai-bot.css                 # Floating launcher, modal, and card styles
├── index.html                 # Portal Home & Dashboard
├── result.html                # Semester-wise & Complete Grade Sheets
├── backlog.html               # Active Backlogs & Diagnostic Reports
├── creditChecker.html         # Credit Audit & Detention Checker
├── liveresults.html           # Real-time JNTUH Exam Results
├── classresult.html           # Batch Roll Number Explorer
├── compare.html               # Side-by-side Student Comparator
├── script.js                  # Global result fetching and DOM rendering logic
├── server.js                  # Express server & API proxy
├── style.css                  # Custom styling & animations
├── exams.json                 # Exam code mappings
├── package.json               # Dependencies and npm scripts
└── README.md                  # Project documentation
```

---

## 👨‍💻 Author

**Narendra Yenagandula**  
*Final-Year B.Tech Student & Developer*  
- **GitHub**: [@Narendra2904](https://github.com/Narendra2904)
- **Live Portal**: [btech-jntuh-results.vercel.app](https://btech-jntuh-results.vercel.app)
- **Android App**: [Download APK](https://expo.dev/artifacts/eas/hUXNz5RPAG1R9Wc8K8geDb.apk)

---

## ⭐ Support & Feedback

If this portal helps you navigate your JNTUH results:
- Give this repository a ⭐ on GitHub!
- Share it with your classmates and batch groups.
- Report any bugs or submit feature suggestions via GitHub Issues.

<p align="center">
  <em>“Built by students, for students — fast, clean, and reliable.”</em>
</p>
