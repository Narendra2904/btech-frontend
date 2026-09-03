/**
 * ==========================================================================
 * BACKBENCHERS AI ACADEMIC ASSISTANT
 * Autonomous Academic & Result Intelligence for JNTUH B.Tech Students
 * ==========================================================================
 */

(function () {
  "use strict";

  // Configuration & State
  const CONFIG = {
    apiBase: "https://jntuh-backend-7rad.onrender.com",
    aiProxyUrl: "/api/chat-ai",
    brandName: "Backbenchers AI",
    totalDegreeCredits: 160
  };

  const GRADE_POINTS = {
    O: 10,
    "A+": 9,
    A: 8,
    "B+": 7,
    B: 6,
    C: 5,
    D: 4,
    P: 4,
    F: 0,
    Ab: 0,
    "-": 0
  };

  /**
   * 1. REGULATION & ENTRY TYPE DETECTOR
   * Identifies Regulation (R22/R18/R16) and handles Lateral Entry (XXXX5AXXXX)
   * Lateral Entry students have strictly 6 semesters (2-1 to 4-2) and 120 total degree credits.
   */
  function getStudentAcademicProfile(hallTicket) {
    const ht = (hallTicket || "").trim().toUpperCase();
    // Lateral Entry check: '5A' at index 4-5 (e.g. 22075A0501, 23S45A6608)
    const isLateral = (ht.length >= 6 && ht.substring(4, 6) === "5A") || ht.charAt(4) === "5";
    const yearPrefix = parseInt(ht.substring(0, 2), 10);

    let regulation = "R18";
    let totalSemesters = isLateral ? 6 : 8;
    let totalDegreeCredits = isLateral ? 120 : 160;
    let startingSemester = isLateral ? "2-1" : "1-1";

    if (!isNaN(yearPrefix)) {
      if (isLateral) {
        // Lateral Entry joins 2nd year with the previous regular batch:
        // 23, 24+ joined 2022+ batch -> R22
        // 19, 20, 21, 22 joined 2018-2021 batch -> R18
        // 17, 18 joined 2016-2017 batch -> R16
        if (yearPrefix >= 23) regulation = "R22";
        else if (yearPrefix >= 19) regulation = "R18";
        else if (yearPrefix >= 17) regulation = "R16";
      } else {
        // Regular Entry (4-Year, 8 Semesters):
        // 22, 23, 24+ -> R22
        // 18, 19, 20, 21 -> R18
        // 16, 17 -> R16
        if (yearPrefix >= 22) regulation = "R22";
        else if (yearPrefix >= 18) regulation = "R18";
        else if (yearPrefix >= 16) regulation = "R16";
      }
    }

    return {
      isLateral,
      regulation,
      totalSemesters,
      totalDegreeCredits,
      startingSemester,
      entryType: isLateral ? "Lateral Entry (6 Semesters: 2-1 to 4-2)" : "Regular Entry (8 Semesters: 1-1 to 4-2)",
      batchYear: `20${yearPrefix || "21"}`
    };
  }

  /**
   * 2. FIRST NAME EXTRACTOR
   * In JNTUH records, Surname is at index 0 (e.g. "YENAGANDULA NARENDRA" -> First Name: "NARENDRA")
   */
  function getStudentFirstName(fullName) {
    if (!fullName || typeof fullName !== "string") return "Student";
    const clean = fullName.trim().replace(/\s+/g, " ");
    const parts = clean.split(" ");
    if (parts.length === 1) return parts[0];
    // In JNTUH, Surname is at index 0, candidate's First / Given Name is the remaining words
    return parts.slice(1).join(" ");
  }

  /**
   * Regulation-aware Grade Point mapping
   */
  function getGradePoint(grade, regulation = "R18") {
    if (!grade) return 0;
    const g = grade.trim().toUpperCase();
    if (regulation === "R16") {
      if (g === "S" || g === "O") return 10;
      if (g === "A") return 9;
      if (g === "B") return 8;
      if (g === "C") return 7;
      if (g === "D") return 6;
      if (g === "E") return 5;
      return 0;
    }
    // R18 & R22
    if (g === "O") return 10;
    if (g === "A+") return 9;
    if (g === "A") return 8;
    if (g === "B+") return 7;
    if (g === "B") return 6;
    if (g === "C") return 5;
    if (g === "D" || g === "P") return 4;
    return 0;
  }

  /**
   * Calculate SGPA for a semester based on regulation
   */
  function calculateSemesterSGPA(subjects, regulation = "R18") {
    if (!Array.isArray(subjects) || subjects.length === 0) return "0.00";
    let totalCredits = 0;
    let totalPoints = 0;
    subjects.forEach((sub) => {
      const gp = getGradePoint(sub.grade, regulation);
      const cr = parseFloat(sub.credits || 0);
      totalCredits += cr;
      totalPoints += gp * cr;
    });
    return totalCredits === 0 ? "0.00" : (totalPoints / totalCredits).toFixed(2);
  }

  /**
   * Calculate CGPA across all completed semesters based on student's regulation
   */
  function calculateStudentCGPA(student) {
    if (!student || !Array.isArray(student.semesters)) return "0.00";
    const profile = getStudentAcademicProfile(student.hallTicket);

    const latestSubjectMap = new Map();
    student.semesters.forEach((sem) => {
      (sem.subjects || []).forEach((sub) => {
        const code = (sub.subjectCode || sub.code || "").trim();
        if (!code) return;
        const prev = latestSubjectMap.get(code);
        const prevGp = prev ? getGradePoint(prev.grade, profile.regulation) : -1;
        const currGp = getGradePoint(sub.grade, profile.regulation);
        if (!prev || currGp > prevGp || Number(sub.attemptNumber || 0) >= Number(prev.attemptNumber || 0)) {
          latestSubjectMap.set(code, sub);
        }
      });
    });

    let totalCredits = 0;
    let totalPoints = 0;
    latestSubjectMap.forEach((sub) => {
      const gp = getGradePoint(sub.grade, profile.regulation);
      const cr = parseFloat(sub.credits || 0);
      if (gp > 0) {
        totalCredits += cr;
        totalPoints += gp * cr;
      }
    });

    return totalCredits === 0 ? "0.00" : (totalPoints / totalCredits).toFixed(2);
  }

  /**
   * Navigate to the required semester result on the page or via URL
   */
  function navigateToSemester(semName) {
    const sem = (semName || "").trim().toUpperCase();
    const semSelect = document.getElementById("semesterSelect");

    if (semSelect) {
      let targetVal = sem;
      if (targetVal === "ALL" || targetVal === "ALL SEMESTERS") targetVal = "all";

      const opts = Array.from(semSelect.options);
      const match = opts.find(
        (o) =>
          o.value.toUpperCase() === targetVal ||
          o.value.toUpperCase().includes(targetVal) ||
          o.textContent.toUpperCase().includes(targetVal)
      );

      if (match) {
        semSelect.value = match.value;
        if (typeof renderResult === "function") {
          renderResult();
        } else {
          semSelect.dispatchEvent(new Event("change"));
        }

        const container = document.getElementById("resultContainer");
        if (container) {
          container.classList.remove("hidden");
          container.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return { success: true, semester: match.value };
      }
    }

    if (state.currentStudent && state.currentStudent.hallTicket) {
      window.location.href = `result.html?ht=${encodeURIComponent(state.currentStudent.hallTicket)}&sem=${encodeURIComponent(sem)}`;
      return { success: true, redirect: true };
    }

    return { success: false };
  }

  /**
   * Formats a direct Resource & Search Hub for any specific subject
   * Generates direct Google Notes/PDF Search & YouTube Playlist/Telugu Search links
   */
  function formatSubjectSearchHub(subjectName, subjectCode = "") {
    const student = state.currentStudent;
    const profile = student ? getStudentAcademicProfile(student.hallTicket) : { regulation: "R18", isLateral: false };
    const reg = profile.regulation;

    const queryNotes = `${subjectName} ${subjectCode} JNTUH ${reg} notes pdf lecture material handwritten`;
    const googleNotesUrl = `https://www.google.com/search?q=${encodeURIComponent(queryNotes)}`;

    const queryYoutube = `${subjectName} JNTUH ${reg} playlist lectures`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(queryYoutube)}`;

    const queryTelugu = `${subjectName} in Telugu JNTUH`;
    const youtubeTeluguUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(queryTelugu)}`;

    const queryGfg = `${subjectName} geeksforgeeks tutorial`;
    const gfgUrl = `https://www.google.com/search?q=${encodeURIComponent(queryGfg)}`;

    return `
      <div class="bb-ai-card">
        <div class="bb-ai-card-header">
          <span class="bb-ai-card-title"><i class="fas fa-graduation-cap text-yellow-400"></i> Study & Video Resource Hub</span>
          <span class="bb-ai-card-badge bb-badge-info">${reg}</span>
        </div>

        <div class="mb-3">
          <h4 class="text-sm font-black text-white uppercase">${subjectName}</h4>
          <span class="text-[10px] text-zinc-400 font-mono">${subjectCode ? `Code: ${subjectCode} • ` : ""}JNTUH ${reg} Regulation</span>
        </div>

        <p class="text-xs text-zinc-300 mb-3">
          Direct browser search links for lecture notes, PDF downloads, and YouTube video tutorials:
        </p>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <a href="${googleNotesUrl}" target="_blank" rel="noopener noreferrer" class="bb-ai-btn-sm" style="text-decoration:none; justify-content:flex-start; padding:8px 12px; font-size:12px;">
            <i class="fab fa-google text-blue-400 mr-2 text-sm"></i>
            <div>
              <strong>Search Google Notes & PDFs</strong>
              <div class="text-[9px] text-zinc-400 font-normal">Handwritten notes, previous papers & PDF downloads</div>
            </div>
          </a>

          <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" class="bb-ai-btn-sm" style="text-decoration:none; justify-content:flex-start; padding:8px 12px; font-size:12px;">
            <i class="fab fa-youtube text-red-500 mr-2 text-sm"></i>
            <div>
              <strong>Search YouTube Video Playlists</strong>
              <div class="text-[9px] text-zinc-400 font-normal">Unit-wise full syllabus video series</div>
            </div>
          </a>

          <a href="${youtubeTeluguUrl}" target="_blank" rel="noopener noreferrer" class="bb-ai-btn-sm" style="text-decoration:none; justify-content:flex-start; padding:8px 12px; font-size:12px;">
            <i class="fab fa-youtube text-yellow-400 mr-2 text-sm"></i>
            <div>
              <strong>Search YouTube Lectures in Telugu</strong>
              <div class="text-[9px] text-zinc-400 font-normal">Easy-to-understand explanations in Telugu</div>
            </div>
          </a>

          <a href="${gfgUrl}" target="_blank" rel="noopener noreferrer" class="bb-ai-btn-sm" style="text-decoration:none; justify-content:flex-start; padding:8px 12px; font-size:12px;">
            <i class="fas fa-laptop-code text-green-400 mr-2 text-sm"></i>
            <div>
              <strong>Search Online Tutorials & Reference</strong>
              <div class="text-[9px] text-zinc-400 font-normal">GeeksforGeeks, TutorialsPoint & docs</div>
            </div>
          </a>

          <a href="https://btech-notes.vercel.app" target="_blank" rel="noopener noreferrer" class="bb-ai-btn-sm" style="text-decoration:none; justify-content:flex-start; padding:8px 12px; font-size:12px;">
            <i class="fas fa-book-reader text-purple-400 mr-2 text-sm"></i>
            <div>
              <strong>Backbenchers Notes Portal</strong>
              <div class="text-[9px] text-zinc-400 font-normal">Official curated notes portal</div>
            </div>
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Semester Navigator List
   */
  function formatSemesterNavigationList(student) {
    if (!student || !Array.isArray(student.semesters)) {
      return `<p>No semester records found.</p>`;
    }

    const profile = getStudentAcademicProfile(student.hallTicket);
    const uniqueSemNames = [...new Set(student.semesters.map((s) => s.semester || ""))].filter(Boolean);

    const buttonsHtml = uniqueSemNames
      .map((sem) => {
        const semObj = student.semesters.find((s) => s.semester === sem);
        const sgpa = semObj ? calculateSemesterSGPA(semObj.subjects, profile.regulation) : "—";
        return `
          <div class="bb-ai-sim-row" style="margin-bottom: 6px;">
            <div>
              <strong class="text-white">Semester ${sem}</strong>
              <span class="text-[10px] text-yellow-400 block font-bold">SGPA: ${sgpa}</span>
            </div>
            <button class="bb-ai-btn-sm" data-ai-action="nav_sem" data-ai-param="${sem}">
              <i class="fas fa-external-link-alt"></i> View Result
            </button>
          </div>
        `;
      })
      .join("");

    return `
      <div class="bb-ai-card">
        <div class="bb-ai-card-header">
          <span class="bb-ai-card-title"><i class="fas fa-folder-open text-yellow-400"></i> Semester Results Navigator</span>
          <span class="bb-ai-card-badge bb-badge-info">${profile.isLateral ? "Lateral Entry (6 Sems)" : "Regular (8 Sems)"}</span>
        </div>

        <p class="text-xs mb-2">
          Click any semester below to view the complete result on the page:
        </p>

        ${buttonsHtml}

        <div class="bb-ai-inline-actions mt-2">
          <button class="bb-ai-btn-sm" data-ai-action="nav_sem" data-ai-param="all">
            <i class="fas fa-list"></i> View All Semesters
          </button>
        </div>
      </div>
    `;
  }

  let state = {
    isOpen: false,
    currentStudent: null,
    history: [],
    isTyping: false
  };

  // Cache for student results by HTNO
  const studentCache = new Map();

  /* ==========================================================================
     UI INJECTION & INITIALIZATION
     ========================================================================== */

  function initBot() {
    if (document.getElementById("bb-ai-launcher")) return;

    injectLauncher();
    injectChatWindow();
    bindGlobalEvents();
    checkForPageStudent();
  }

  function injectLauncher() {
    const launcher = document.createElement("div");
    launcher.id = "bb-ai-launcher";
    launcher.title = "Ask Backbenchers AI about results, supplies & improvements";
    launcher.innerHTML = `
      <div class="bb-ai-pulse-dot"></div>
      <div class="bb-ai-bot-icon"><i class="fas fa-robot"></i></div>
      <span class="bb-ai-label">AI Result Bot</span>
    `;
    launcher.addEventListener("click", toggleChat);
    document.body.appendChild(launcher);
  }

  function injectChatWindow() {
    const win = document.createElement("div");
    win.id = "bb-ai-window";
    win.innerHTML = `
      <!-- Header -->
      <div class="bb-ai-header">
        <div class="bb-ai-header-left">
          <div class="bb-ai-avatar">
            <i class="fas fa-brain"></i>
            <span class="bb-ai-status-indicator"></span>
          </div>
          <div>
            <div class="bb-ai-header-title">
              ${CONFIG.brandName} <span class="bb-badge">⚡ 2.0</span>
            </div>
            <div class="bb-ai-header-sub">Academic & Supply Analyzer</div>
          </div>
        </div>
        <div class="bb-ai-header-actions">
          <button class="bb-ai-action-btn" id="bb-ai-btn-clear" title="Clear Chat">
            <i class="fas fa-trash-alt text-xs"></i>
          </button>
          <button class="bb-ai-action-btn" id="bb-ai-btn-close" title="Close">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
      </div>

      <!-- Student Context Pill -->
      <div class="bb-ai-context-banner" id="bb-ai-context-banner">
        <div class="bb-ai-context-info" id="bb-ai-context-info">
          <i class="fas fa-id-card text-yellow-500"></i>
          <span id="bb-ai-context-text">No Hall Ticket Selected</span>
        </div>
        <button class="bb-ai-context-change" id="bb-ai-btn-change-ht">Change</button>
      </div>

      <!-- Quick Action Chips -->
      <div class="bb-ai-quick-pills" id="bb-ai-quick-pills">
        <button class="bb-ai-pill-btn" data-query="Check my active supplies"><i class="fas fa-exclamation-circle text-red-400"></i> Check Supplies</button>
        <button class="bb-ai-pill-btn" data-query="Which subjects should I improve?"><i class="fas fa-chart-line text-yellow-400"></i> Improvement Areas</button>
        <button class="bb-ai-pill-btn" data-query="Am I safe from credit detention?"><i class="fas fa-shield-alt text-green-400"></i> Promotion / Detention</button>
        <button class="bb-ai-pill-btn" data-query="Am I eligible for Grace Marks?"><i class="fas fa-graduation-cap text-pink-400"></i> Grace Marks</button>
        <button class="bb-ai-pill-btn" data-query="Open What-If CGPA Simulator"><i class="fas fa-gamepad text-indigo-400"></i> What-If Simulator</button>
        <button class="bb-ai-pill-btn" data-query="Scan Placement & Career Eligibility"><i class="fas fa-briefcase text-emerald-400"></i> Placement Scan</button>
        <button class="bb-ai-pill-btn" data-query="Find Study Notes & Materials"><i class="fas fa-book-open text-orange-400"></i> Study Notes</button>
        <button class="bb-ai-pill-btn" data-query="How to reach 7.5 CGPA?"><i class="fas fa-bullseye text-blue-400"></i> Target CGPA</button>
        <button class="bb-ai-pill-btn" data-query="Should I apply for RC/RV revaluation?"><i class="fas fa-file-signature text-purple-400"></i> RC/RV Advice</button>
        <button class="bb-ai-pill-btn" data-query="Give me a roadmap to clear backlogs"><i class="fas fa-lightbulb text-amber-300"></i> Supply Strategy</button>
        <button class="bb-ai-pill-btn" data-query="Full Academic Audit Report"><i class="fas fa-clipboard-check text-cyan-400"></i> Full Audit</button>
      </div>

      <!-- Messages Feed -->
      <div class="bb-ai-messages-feed" id="bb-ai-messages-feed"></div>

      <!-- Typing Indicator -->
      <div id="bb-ai-typing-container" style="display:none; padding: 0 16px 12px 16px;">
        <div class="bb-ai-typing">
          <div class="bb-ai-dot"></div>
          <div class="bb-ai-dot"></div>
          <div class="bb-ai-dot"></div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="bb-ai-input-area">
        <div class="bb-ai-input-wrapper">
          <input type="text" id="bb-ai-input" placeholder="Ask about supplies, improvements, or speak..." autocomplete="off" />
          <button class="bb-ai-mic-btn" id="bb-ai-btn-mic" title="Voice Search (Speak)">
            <i class="fas fa-microphone"></i>
          </button>
          <button class="bb-ai-send-btn" id="bb-ai-btn-send" title="Send message">
            <i class="fas fa-arrow-up"></i>
          </button>
        </div>
        <div class="bb-ai-input-footer">
          <span>⚡ JNTUH R18 & R22 Autonomous Intelligence</span>
          <span>Press Enter ↵ or Speak 🎙️</span>
        </div>
      </div>
    `;

    document.body.appendChild(win);

    // Initial greeting
    addBotMessage(getWelcomeMessage());

    // Bind event listeners
    document.getElementById("bb-ai-btn-close").addEventListener("click", closeChat);
    document.getElementById("bb-ai-btn-clear").addEventListener("click", clearChat);
    document.getElementById("bb-ai-btn-change-ht").addEventListener("click", promptForHallTicket);
    document.getElementById("bb-ai-btn-send").addEventListener("click", handleUserSend);

    const input = document.getElementById("bb-ai-input");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleUserSend();
      }
    });

    // Quick chip clicks
    const pills = document.getElementById("bb-ai-quick-pills");
    pills.addEventListener("click", (e) => {
      const btn = e.target.closest(".bb-ai-pill-btn");
      if (btn && btn.dataset.query) {
        processUserQuery(btn.dataset.query);
      }
    });

    // Message click delegation (for action buttons inside bot messages)
    document.getElementById("bb-ai-messages-feed").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-ai-action]");
      if (!btn) return;
      const action = btn.dataset.aiAction;
      const param = btn.dataset.aiParam || "";
      handleInlineAction(action, param, btn);
    });

    // Voice recognition
    initVoiceInput();
  }

  function bindGlobalEvents() {
    // Esc key closes chat
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.isOpen) {
        closeChat();
      }
    });

    // Listen for What-If simulator dropdown changes
    document.addEventListener("change", (e) => {
      if (e.target.classList.contains("bb-ai-sim-select")) {
        updateWhatIfCalculation();
      }
    });

    // Observe changes to page student data
    setInterval(checkForPageStudent, 2000);
  }

  /* ==========================================================================
     DATA EXTRACTION & CONTEXT AWARENESS
     ========================================================================== */

  function checkForPageStudent() {
    // 1. Check window.FULL_RESULT (used on index.html, result.html)
    if (window.FULL_RESULT && typeof window.FULL_RESULT === "object" && window.FULL_RESULT.hallTicket) {
      if (!state.currentStudent || state.currentStudent.hallTicket !== window.FULL_RESULT.hallTicket) {
        setStudentContext(window.FULL_RESULT);
      }
      return;
    }

    // 2. Check URL search param (e.g. ?ht=21071A0501)
    const urlParams = new URLSearchParams(window.location.search);
    const urlHt = urlParams.get("ht");
    if (urlHt && isHallTicket(urlHt)) {
      if (!state.currentStudent || state.currentStudent.hallTicket !== urlHt.toUpperCase()) {
        fetchStudentResult(urlHt, false);
        return;
      }
    }

    // 3. Check DOM text elements (e.g. #resRoll, #c_Roll, #htDisplay, #studentRoll)
    const rollIds = ["resRoll", "c_Roll", "htDisplay", "studentRoll"];
    for (const id of rollIds) {
      const el = document.getElementById(id);
      if (el) {
        const text = el.innerText.trim();
        if (isHallTicket(text)) {
          if (!state.currentStudent || state.currentStudent.hallTicket !== text) {
            fetchStudentResult(text, false);
            return;
          }
        }
      }
    }

    // 4. Check active input fields (e.g. #hallTicketInput, #creditHTInput, #htInput)
    const inputIds = ["hallTicketInput", "creditHTInput", "htInput"];
    for (const id of inputIds) {
      const el = document.getElementById(id);
      if (el && el.value) {
        const val = el.value.trim().toUpperCase();
        if (isHallTicket(val)) {
          if (!state.currentStudent || state.currentStudent.hallTicket !== val) {
            fetchStudentResult(val, false);
            return;
          }
        }
      }
    }
  }

  function setStudentContext(student) {
    if (!student) return;
    state.currentStudent = student;
    studentCache.set(student.hallTicket.toUpperCase(), student);

    const profile = getStudentAcademicProfile(student.hallTicket);
    const firstName = getStudentFirstName(student.name);

    const banner = document.getElementById("bb-ai-context-banner");
    const text = document.getElementById("bb-ai-context-text");
    if (banner && text) {
      const roll = student.hallTicket || "---";
      const branch = student.branch || "";
      const leBadge = profile.isLateral
        ? `<span class="bb-ai-card-badge" style="background:#2563eb; color:#fff; font-size:8px; margin-left:4px;">LE (6 Sems)</span>`
        : "";
      const regBadge = `<span class="bb-ai-card-badge bb-badge-info" style="font-size:8px; margin-left:4px;">${profile.regulation}</span>`;
      text.innerHTML = `<strong>${roll}</strong> ${firstName ? `(${firstName})` : ""} ${branch ? `• ${branch}` : ""}${regBadge}${leBadge}`;
    }
  }

  function isHallTicket(str) {
    if (!str || typeof str !== "string") return false;
    const clean = str.trim().toUpperCase();
    // JNTU roll format is 10 chars, e.g. 21071A0501, 22S45A6608
    return /^[0-9]{2}[A-Z0-9]{8}$/.test(clean);
  }

  function extractHallTicket(text) {
    if (!text) return null;
    const match = text.toUpperCase().match(/\b[0-9]{2}[A-Z0-9]{8}\b/);
    return match ? match[0] : null;
  }

  async function fetchStudentResult(htno, showNotification = true) {
    const cleanHt = htno.trim().toUpperCase();
    if (studentCache.has(cleanHt)) {
      const cached = studentCache.get(cleanHt);
      setStudentContext(cached);
      const firstName = getStudentFirstName(cached.name);
      if (showNotification) {
        addBotMessage(`✅ Welcome back <strong>${firstName}</strong> (${cleanHt})! How can I help you today?`);
      }
      return cached;
    }

    showTyping();
    try {
      const res = await fetch(`${CONFIG.apiBase}/result/${cleanHt}`);
      const json = await res.json();
      hideTyping();

      if (!json || !json.data) {
        throw new Error("Student record not found. Please verify the Hall Ticket number.");
      }

      let data = json.data;
      if (typeof data === "string") {
        data = JSON.parse(data.replace(/'/g, '"'));
      }

      setStudentContext(data);

      const profile = getStudentAcademicProfile(cleanHt);
      const firstName = getStudentFirstName(data.name);

      if (showNotification) {
        addBotMessage(
          `🎓 Hello <strong>${firstName}</strong>! Retrieved results for <strong>${cleanHt}</strong> (${data.branch || "B.Tech"}).<br>` +
          `<span class="text-[11px] text-zinc-300 font-mono">Regulation: <strong>${profile.regulation}</strong> • ${profile.entryType} • ${profile.totalSemesters} Semesters (${profile.totalDegreeCredits} Total Credits)</span><br><br>` +
          `What would you like to check? Choose an option below or type your question:`,
          [
            { action: "supplies", label: "⚠️ Check Supplies" },
            { action: "improvements", label: "📈 Subject Improvements" },
            { action: "nav_list", label: "📂 Navigate Semesters" },
            { action: "audit", label: "📊 Complete Audit" }
          ]
        );
      }
      return data;
    } catch (err) {
      hideTyping();
      if (showNotification) {
        addBotMessage(`❌ <strong>Could not fetch results for ${cleanHt}:</strong> ${err.message}`);
      }
      return null;
    }
  }

  /* ==========================================================================
     CORE ACADEMIC INTELLIGENCE ENGINES
     ========================================================================== */

  /**
   * 1. ACTIVE SUPPLIES & BACKLOG ENGINE
   * Accurately tracks every subject attempt, finds pending supplies, failure causes.
   */
  function analyzeSupplies(student) {
    if (!student || !Array.isArray(student.semesters)) {
      return { ok: false, error: "No semester records found for this student." };
    }

    const subjectMap = new Map();

    student.semesters.forEach((sem) => {
      const semName = sem.semester || "Unknown";
      (sem.subjects || []).forEach((sub) => {
        const code = (sub.subjectCode || sub.code || "").trim();
        if (!code) return;

        if (!subjectMap.has(code)) {
          subjectMap.set(code, {
            code,
            name: sub.subjectName || sub.name || "Subject",
            semester: semName,
            credits: parseFloat(sub.credits || 0),
            attempts: []
          });
        }

        const entry = subjectMap.get(code);
        entry.attempts.push({
          semester: semName,
          internal: Number(sub.internal) || 0,
          external: Number(sub.external) || 0,
          total: (Number(sub.internal) || 0) + (Number(sub.external) || 0),
          grade: (sub.grade || "").trim().toUpperCase(),
          credits: parseFloat(sub.credits || 0)
        });
      });
    });

    const activeSupplies = [];
    const clearedSupplies = [];
    let pendingCreditsLost = 0;

    subjectMap.forEach((entry) => {
      const hasPassed = entry.attempts.some(
        (att) => att.grade && att.grade !== "F" && att.grade !== "AB" && att.grade !== "-"
      );

      if (!hasPassed) {
        const latestAttempt = entry.attempts[entry.attempts.length - 1];
        const isLab = /LAB|PRACTICAL|WORKSHOP|PROJECT|SEMINAR/i.test(entry.name);

        // Root cause diagnosis
        let reason = "Unknown";
        if (latestAttempt.grade === "AB") {
          reason = "Absent in exam";
        } else if (latestAttempt.external < 26) {
          reason = `Failed External Cutoff (${latestAttempt.external}/75, min 26 required)`;
        } else if (latestAttempt.internal < 14) {
          reason = `Low Internals (${latestAttempt.internal}/25)`;
        } else {
          reason = `Aggregate below passing threshold (${latestAttempt.total}/100)`;
        }

        activeSupplies.push({
          code: entry.code,
          name: entry.name,
          semester: entry.semester,
          credits: latestAttempt.credits || entry.credits,
          attemptCount: entry.attempts.length,
          latest: latestAttempt,
          isLab,
          reason
        });
        pendingCreditsLost += latestAttempt.credits || entry.credits;
      } else if (entry.attempts.length > 1) {
        clearedSupplies.push({
          code: entry.code,
          name: entry.name,
          attemptsCount: entry.attempts.length
        });
      }
    });

    return {
      ok: true,
      activeSupplies,
      clearedSupplies,
      totalActive: activeSupplies.length,
      totalCleared: clearedSupplies.length,
      pendingCreditsLost
    };
  }

  /**
   * 2. SUBJECT IMPROVEMENT ENGINE
   * Identifies borderline pass grades, low internals, high-credit drag subjects.
   */
  function analyzeImprovements(student) {
    if (!student || !Array.isArray(student.semesters)) {
      return { ok: false, error: "No semester records found for this student." };
    }

    const improvements = [];
    const internalWarnings = [];

    // Collect latest state of all subjects
    const latestSubjectMap = new Map();

    student.semesters.forEach((sem) => {
      const semName = sem.semester || "";
      (sem.subjects || []).forEach((sub) => {
        const code = (sub.subjectCode || sub.code || "").trim();
        if (!code) return;

        latestSubjectMap.set(code, {
          code,
          name: sub.subjectName || sub.name || "Subject",
          semester: semName,
          internal: Number(sub.internal) || 0,
          external: Number(sub.external) || 0,
          total: (Number(sub.internal) || 0) + (Number(sub.external) || 0),
          grade: (sub.grade || "").trim().toUpperCase(),
          credits: parseFloat(sub.credits || 0)
        });
      });
    });

    latestSubjectMap.forEach((sub) => {
      // 1. Check for low passing grades (C = 5, D/P = 4)
      if (sub.grade === "C" || sub.grade === "D" || sub.grade === "P") {
        const isCore = sub.credits >= 3;
        const gp = GRADE_POINTS[sub.grade] || 4;
        const potentialGPBoost = 8 - gp; // If upgraded to 'A' (8)
        const cgpaImpact = ((potentialGPBoost * sub.credits) / CONFIG.totalDegreeCredits).toFixed(2);

        improvements.push({
          code: sub.code,
          name: sub.name,
          semester: sub.semester,
          grade: sub.grade,
          credits: sub.credits,
          total: sub.total,
          isCore,
          cgpaImpact,
          recommendation: isCore
            ? `High Priority (Weight: ${sub.credits} Credits). Boosting this subject to 'A' grade would increase overall CGPA by +${cgpaImpact} points.`
            : `Elective/Lab. Revision recommended to strengthen foundation.`
        });
      }

      // 2. Check for low internal scores (internal < 14 out of 25)
      if (sub.internal > 0 && sub.internal < 14 && sub.grade !== "F") {
        internalWarnings.push({
          code: sub.code,
          name: sub.name,
          semester: sub.semester,
          internal: sub.internal,
          external: sub.external,
          grade: sub.grade
        });
      }
    });

    // Sort improvements by highest credit first, then lowest grade
    improvements.sort((a, b) => b.credits - a.credits || (GRADE_POINTS[a.grade] - GRADE_POINTS[b.grade]));

    return {
      ok: true,
      improvements,
      internalWarnings,
      totalNeedingImprovement: improvements.length
    };
  }

  /**
   * 3. PROMOTION & CREDIT DETENTION ENGINE
   * Evaluates JNTUH progression regulations (R18 & R22 criteria).
   */
  function analyzePromotion(student) {
    if (!student || !Array.isArray(student.semesters)) {
      return { ok: false, error: "No semester records found for this student." };
    }

    // Tally passed credits per semester and year
    let totalEarnedCredits = 0;
    let totalMaxCredits = 0;
    const yearSummary = {
      1: { earned: 0, max: 0, sems: ["1-1", "1-2"] },
      2: { earned: 0, max: 0, sems: ["2-1", "2-2"] },
      3: { earned: 0, max: 0, sems: ["3-1", "3-2"] },
      4: { earned: 0, max: 0, sems: ["4-1", "4-2"] }
    };

    // Keep track of unique passed subjects
    const passedSubjectCodes = new Set();
    const allUniqueSubjects = new Map();

    student.semesters.forEach((sem) => {
      const semStr = (sem.semester || "").trim();
      const year = semStr.startsWith("1") ? 1 : semStr.startsWith("2") ? 2 : semStr.startsWith("3") ? 3 : 4;

      (sem.subjects || []).forEach((sub) => {
        const code = (sub.subjectCode || sub.code || "").trim();
        const cr = parseFloat(sub.credits || 0);
        if (!code) return;

        if (!allUniqueSubjects.has(code)) {
          allUniqueSubjects.set(code, { cr, year });
        }

        if (sub.grade && sub.grade !== "F" && sub.grade !== "AB" && sub.grade !== "-") {
          passedSubjectCodes.add(code);
        }
      });
    });

    allUniqueSubjects.forEach((val, code) => {
      totalMaxCredits += val.cr;
      if (yearSummary[val.year]) yearSummary[val.year].max += val.cr;

      if (passedSubjectCodes.has(code)) {
        totalEarnedCredits += val.cr;
        if (yearSummary[val.year]) yearSummary[val.year].earned += val.cr;
      }
    });

    // Detect highest semester completed
    const semNames = student.semesters.map((s) => s.semester || "");
    let currentYear = 1;
    if (semNames.some((s) => s.startsWith("3"))) currentYear = 3;
    else if (semNames.some((s) => s.startsWith("2"))) currentYear = 2;
    if (semNames.some((s) => s.startsWith("4"))) currentYear = 4;

    // Progression rules:
    // 1st to 2nd year: 50% credits of 1st year (~19-20 credits)
    // 2nd to 3rd year: 60% credits of 1st + 2nd year (~47-48 credits)
    const profile = getStudentAcademicProfile(student.hallTicket);

    let ruleText = "";
    let requiredCredits = 0;
    let creditsApplicable = 0;
    let status = "SAFE";
    let margin = 0;

    if (profile.isLateral) {
      // Lateral Entry Progression Rules (Starts at Year 2, strictly 6 semesters):
      if (currentYear <= 2 || (currentYear === 3 && !semNames.includes("3-1"))) {
        // Promotion to 3rd Year: 50% of 2nd year credits (~20 credits out of 40)
        requiredCredits = Math.ceil((yearSummary[2].max || 40) * 0.5) || 20;
        creditsApplicable = yearSummary[2].earned;
        ruleText = "50% of 2nd Year Credits (Lateral Entry Promotion to 3rd Year)";
        margin = creditsApplicable - requiredCredits;
      } else {
        // Promotion to 4th Year: 60% of 2nd & 3rd year credits (~48 credits out of 80)
        const max23 = (yearSummary[2].max || 40) + (yearSummary[3].max || 40);
        requiredCredits = Math.ceil(max23 * 0.6) || 48;
        creditsApplicable = yearSummary[2].earned + yearSummary[3].earned;
        ruleText = "60% of Credits in 2nd & 3rd Year (Lateral Entry Promotion to 4th Year)";
        margin = creditsApplicable - requiredCredits;
      }
    } else {
      // Regular Progression Rules (Starts at Year 1, 8 semesters):
      if (currentYear === 1 || (currentYear === 2 && !semNames.includes("2-2"))) {
        requiredCredits = Math.ceil(yearSummary[1].max * 0.5) || 19;
        creditsApplicable = yearSummary[1].earned;
        ruleText = "50% of 1st Year Credits (Promotion to 2nd Year)";
        margin = creditsApplicable - requiredCredits;
      } else if (currentYear === 2 || (currentYear === 3 && !semNames.includes("3-2"))) {
        const max12 = yearSummary[1].max + yearSummary[2].max;
        requiredCredits = Math.ceil(max12 * 0.6) || 47;
        creditsApplicable = yearSummary[1].earned + yearSummary[2].earned;
        ruleText = "60% of Total Credits up to 2nd Year (Promotion to 3rd Year)";
        margin = creditsApplicable - requiredCredits;
      } else {
        const max123 = yearSummary[1].max + yearSummary[2].max + yearSummary[3].max;
        requiredCredits = Math.ceil(max123 * 0.6) || 73;
        creditsApplicable = yearSummary[1].earned + yearSummary[2].earned + yearSummary[3].earned;
        ruleText = "60% of Total Credits up to 3rd Year (Promotion to 4th Year)";
        margin = creditsApplicable - requiredCredits;
      }
    }

    if (margin < 0) {
      status = "DETENTION_RISK";
    } else if (margin <= 4) {
      status = "BORDERLINE";
    } else {
      status = "SAFE";
    }

    return {
      ok: true,
      currentYear,
      totalEarnedCredits,
      totalMaxCredits,
      requiredCredits,
      creditsApplicable,
      status,
      margin,
      ruleText,
      yearSummary,
      isLateral: profile.isLateral,
      regulation: profile.regulation
    };
  }

  /**
   * 4. TARGET CGPA CALCULATOR
   * Calculates required SGPA in remaining semesters to achieve student's goal.
   * Accurately factors in 120 total credits for Lateral Entry vs 160 for Regular.
   */
  function calculateTargetCgpa(student, targetGoal) {
    if (!student || !Array.isArray(student.semesters)) {
      return { ok: false, error: "No semester records found for this student." };
    }

    const profile = getStudentAcademicProfile(student.hallTicket);
    const totalCreditsNeeded = profile.totalDegreeCredits; // 120 for LE, 160 for Regular

    let earnedCredits = 0;
    let totalPoints = 0;

    student.semesters.forEach((sem) => {
      (sem.subjects || []).forEach((sub) => {
        const gp = getGradePoint(sub.grade, profile.regulation);
        const cr = parseFloat(sub.credits || 0);
        if (gp > 0) {
          earnedCredits += cr;
          totalPoints += gp * cr;
        }
      });
    });

    const currentCgpa = earnedCredits === 0 ? 0 : totalPoints / earnedCredits;
    const remainingCredits = Math.max(0, totalCreditsNeeded - earnedCredits);

    if (remainingCredits <= 0) {
      return {
        ok: true,
        currentCgpa: currentCgpa.toFixed(2),
        isComplete: true,
        message: `Degree is already completed with CGPA: ${currentCgpa.toFixed(2)}`
      };
    }

    // Target Total Points = targetGoal * totalCreditsNeeded
    const neededTotalPoints = targetGoal * totalCreditsNeeded;
    const neededRemainingPoints = neededTotalPoints - totalPoints;
    const requiredSGPA = neededRemainingPoints / remainingCredits;

    const maxAchievableCgpa = (totalPoints + remainingCredits * 10) / totalCreditsNeeded;

    return {
      ok: true,
      currentCgpa: currentCgpa.toFixed(2),
      targetGoal: targetGoal.toFixed(2),
      earnedCredits,
      remainingCredits,
      requiredSGPA: requiredSGPA.toFixed(2),
      maxAchievableCgpa: maxAchievableCgpa.toFixed(2),
      isFeasible: requiredSGPA <= 10.0,
      isEasy: requiredSGPA <= 7.5
    };
  }

  /**
   * 5. REVALUATION (RC/RV) ADVISOR
   * Evaluates failed subjects to determine if paying for RC/RV is recommended.
   */
  function analyzeRevaluation(student) {
    const supplyReport = analyzeSupplies(student);
    if (!supplyReport.ok || supplyReport.activeSupplies.length === 0) {
      return {
        ok: true,
        hasSupplies: false,
        message: "No active backlogs found! Revaluation is not needed."
      };
    }

    const recommendations = [];

    supplyReport.activeSupplies.forEach((sub) => {
      const ext = sub.latest.external;
      const isAbsent = sub.latest.grade === "AB";

      let verdict = "NO";
      let badgeClass = "bb-badge-danger";
      let advice = "";

      if (isAbsent) {
        verdict = "NOT APPLICABLE";
        advice = "Marked Absent (AB). Cannot apply for RC/RV.";
      } else if (ext >= 23 && ext <= 25) {
        verdict = "STRONGLY RECOMMENDED";
        badgeClass = "bb-badge-success";
        advice = `You scored ${ext}/75, just ${26 - ext} marks short of the 26 pass mark! Totaling error or 1-2 step marks in RC/RV could clear this subject.`;
      } else if (ext >= 19 && ext <= 22) {
        verdict = "MODERATE CHANCE";
        badgeClass = "bb-badge-warning";
        advice = `Scored ${ext}/75 (${26 - ext} marks short). Apply only if you are confident your answers and key points were evaluated strictly.`;
      } else {
        verdict = "NOT RECOMMENDED (SAVE FEE)";
        badgeClass = "bb-badge-danger";
        advice = `Scored ${ext}/75. A gap of ${26 - ext} marks is very difficult to bridge in recounting. Save your ₹1000 fee and focus on the supplementary exam!`;
      }

      recommendations.push({
        code: sub.code,
        name: sub.name,
        semester: sub.semester,
        external: ext,
        verdict,
        badgeClass,
        advice
      });
    });

    return {
      ok: true,
      hasSupplies: true,
      recommendations
    };
  }

  /**
   * 6. JNTUH GRACE MARKS & SUBJECT EXEMPTION ANALYZER
   * Analyzes 0.15% rule and R18/R16 subject exemption regulations.
   */
  function analyzeGraceMarks(student) {
    if (!student || !Array.isArray(student.semesters)) {
      return { ok: false, error: "No student records found." };
    }

    const ht = (student.hallTicket || "").trim().toUpperCase();
    const yearPrefix = parseInt(ht.substring(0, 2), 10);
    const isLateral = ht.charAt(4) === "5";

    let regulation = "R18";
    if (!isNaN(yearPrefix)) {
      if (yearPrefix >= 22 && !isLateral) regulation = "R22";
      else if (yearPrefix >= 23 && isLateral) regulation = "R22";
      else if (yearPrefix >= 18) regulation = "R18";
      else if (yearPrefix >= 16) regulation = "R16";
    }

    const supReport = analyzeSupplies(student);
    if (!supReport.ok) return supReport;

    const theorySupplies = supReport.activeSupplies.filter((s) => !s.isLab);
    const labSupplies = supReport.activeSupplies.filter((s) => s.isLab);

    const maxGraceMarks = 9; // 0.15% of ~5600 total B.Tech marks
    let totalShortfall = 0;
    const shortfallDetails = [];

    theorySupplies.forEach((s) => {
      const extShortfall = Math.max(0, 26 - s.latest.external);
      const totShortfall = Math.max(0, 40 - s.latest.total);
      const needed = Math.max(extShortfall, totShortfall);
      totalShortfall += needed;
      shortfallDetails.push({
        name: s.name,
        code: s.code,
        semester: s.semester,
        needed,
        external: s.latest.external,
        total: s.latest.total
      });
    });

    const isEligibleByMarks =
      totalShortfall > 0 &&
      totalShortfall <= maxGraceMarks &&
      theorySupplies.length <= 3 &&
      labSupplies.length === 0;

    const promo = analyzePromotion(student);
    const earnedCredits = promo.totalEarnedCredits;
    const canExempt =
      (regulation === "R18" || regulation === "R16") &&
      earnedCredits >= 154 &&
      theorySupplies.length <= 2;

    return {
      ok: true,
      regulation,
      theorySupplies,
      labSupplies,
      totalShortfall,
      maxGraceMarks,
      shortfallDetails,
      isEligibleByMarks,
      canExempt,
      earnedCredits
    };
  }

  /**
   * 7. PLACEMENTS & CAREER READINESS SCANNER
   * Evaluates CGPA & backlogs against mass IT recruiters, tier-1 companies & GATE.
   */
  function analyzePlacements(student) {
    const supplies = analyzeSupplies(student);

    let totalCredits = 0;
    let totalPoints = 0;
    (student.semesters || []).forEach((sem) => {
      (sem.subjects || []).forEach((sub) => {
        const gp = GRADE_POINTS[sub.grade] ?? 0;
        const cr = parseFloat(sub.credits || 0);
        if (gp > 0) {
          totalCredits += cr;
          totalPoints += gp * cr;
        }
      });
    });

    const cgpa = totalCredits === 0 ? 0 : parseFloat((totalPoints / totalCredits).toFixed(2));
    const activeBacklogs = supplies.totalActive;
    const historyOfBacklogs = supplies.totalCleared + supplies.totalActive;

    const massEligible = cgpa >= 6.0 && activeBacklogs <= 1;
    const productEligible = cgpa >= 7.0 && activeBacklogs === 0;
    const higherStudiesEligible = cgpa >= 6.5;

    return {
      ok: true,
      cgpa,
      activeBacklogs,
      historyOfBacklogs,
      massEligible,
      productEligible,
      higherStudiesEligible
    };
  }

  /* ==========================================================================
     RESPONSE GENERATORS & FORMATTERS
     ========================================================================== */

  function formatSuppliesResponse(student) {
    const rep = analyzeSupplies(student);
    if (!rep.ok) return `<p>${rep.error}</p>`;

    if (rep.totalActive === 0) {
      return `
        <div class="bb-ai-card">
          <div class="bb-ai-card-header">
            <span class="bb-ai-card-title"><i class="fas fa-check-circle text-green-400"></i> Active Backlogs Status</span>
            <span class="bb-ai-card-badge bb-badge-success">All Clear</span>
          </div>
          <p class="text-green-400 font-bold mb-2">🎉 Awesome news! You have <strong>0 active backlogs</strong>.</p>
          <p class="text-xs text-zinc-400">
            ${rep.totalCleared > 0 ? `You have successfully cleared <strong>${rep.totalCleared} supply subjects</strong> in earlier attempts.` : `You have maintained a 100% clean record across all semesters!`}
          </p>
        </div>
      `;
    }

    let rowsHtml = rep.activeSupplies
      .map(
        (s) => `
      <tr>
        <td>
          <strong>${s.name}</strong><br>
          <span class="text-[9px] text-zinc-400 font-mono">${s.code} • ${s.semester}</span>
          <div style="margin-top:4px;">
            <button class="bb-ai-btn-sm" style="padding:2px 7px; font-size:9px;" data-ai-action="search_subject" data-ai-param="${s.name}" data-ai-code="${s.code}">
              <i class="fas fa-search"></i> Notes & YouTube
            </button>
          </div>
        </td>
        <td style="text-align:center;">${s.latest.internal}</td>
        <td style="text-align:center;">${s.latest.external}</td>
        <td style="text-align:center;"><span class="text-red-400 font-bold">${s.latest.grade}</span></td>
      </tr>
    `
      )
      .join("");

    return `
      <div class="bb-ai-card">
        <div class="bb-ai-card-header">
          <span class="bb-ai-card-title"><i class="fas fa-exclamation-triangle text-amber-400"></i> Pending Supplies</span>
          <span class="bb-ai-card-badge bb-badge-danger">${rep.totalActive} Active</span>
        </div>
        
        <p class="text-xs mb-2">
          You currently have <strong class="text-red-400">${rep.totalActive} pending supplies</strong> costing <strong class="text-yellow-400">${rep.pendingCreditsLost} credits</strong>.
        </p>

        <table class="bb-ai-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th style="text-align:center;">Int</th>
              <th style="text-align:center;">Ext</th>
              <th style="text-align:center;">Gr</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="bb-ai-alert bb-ai-alert-tip">
          <strong>💡 AI Diagnosis:</strong> Most pending subjects were missed due to falling short of the external 26/75 cutoff. Check our <strong>Supply Strategy</strong> for clearing them quickly!
        </div>

        <div class="bb-ai-inline-actions">
          <button class="bb-ai-btn-sm" data-ai-action="rcrv"><i class="fas fa-file-signature"></i> Check RC/RV Worth</button>
          <button class="bb-ai-btn-sm" data-ai-action="prep_strategy"><i class="fas fa-book-open"></i> Prep Roadmap</button>
          <button class="bb-ai-btn-sm" data-ai-action="nav_list"><i class="fas fa-folder-open"></i> Navigate Semesters</button>
          <button class="bb-ai-btn-sm" data-ai-action="page_backlog"><i class="fas fa-external-link-alt"></i> View in Backlog Page</button>
        </div>
      </div>
    `;
  }

  function formatImprovementResponse(student) {
    const rep = analyzeImprovements(student);
    if (!rep.ok) return `<p>${rep.error}</p>`;

    if (rep.totalNeedingImprovement === 0) {
      return `
        <div class="bb-ai-card">
          <div class="bb-ai-card-header">
            <span class="bb-ai-card-title"><i class="fas fa-award text-yellow-400"></i> Performance Analysis</span>
            <span class="bb-ai-card-badge bb-badge-success">Excellent</span>
          </div>
          <p class="text-xs">
            🌟 Outstanding performance! You don't have any borderline (C / D) grades in your passed subjects. Keep up the high standard!
          </p>
        </div>
      `;
    }

    let itemsHtml = rep.improvements
      .slice(0, 4)
      .map(
        (sub) => `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 8px 10px; margin-bottom: 6px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong class="text-white text-xs">${sub.name}</strong>
          <span class="bb-ai-card-badge bb-badge-warning">Grade: ${sub.grade}</span>
        </div>
        <div class="text-[10px] text-zinc-400 mt-1">
          Sem: <strong>${sub.semester}</strong> • Weight: <strong>${sub.credits} Credits</strong>
        </div>
        <p class="text-[11px] text-yellow-200 mt-1 mb-1">
          👉 ${sub.recommendation}
        </p>
        <button class="bb-ai-btn-sm" style="padding:2px 7px; font-size:9px;" data-ai-action="search_subject" data-ai-param="${sub.name}" data-ai-code="${sub.code}">
          <i class="fas fa-search"></i> Notes & YouTube
        </button>
      </div>
    `
      )
      .join("");

    let internalWarningHtml = "";
    if (rep.internalWarnings.length > 0) {
      internalWarningHtml = `
        <div class="bb-ai-alert bb-ai-alert-danger mt-2">
          <strong>⚠️ Low Internals Detected:</strong> In subjects like <em>${rep.internalWarnings[0].name}</em>, internal marks were low (${rep.internalWarnings[0].internal}/25). 
          In JNTUH, scoring 20+ in internal mid exams provides an effortless cushion for passing external exams!
        </div>
      `;
    }

    return `
      <div class="bb-ai-card">
        <div class="bb-ai-card-header">
          <span class="bb-ai-card-title"><i class="fas fa-chart-line text-yellow-400"></i> Subjects To Improve</span>
          <span class="bb-ai-card-badge bb-badge-warning">${rep.totalNeedingImprovement} Found</span>
        </div>

        <p class="text-xs mb-2">
          These passed subjects have low grade points (C or D) that are pulling your CGPA down:
        </p>

        ${itemsHtml}
        ${internalWarningHtml}

        <div class="bb-ai-inline-actions">
          <button class="bb-ai-btn-sm" data-ai-action="cgpa_calc" data-ai-param="7.5"><i class="fas fa-calculator"></i> Calculate 7.5 CGPA Goal</button>
          <button class="bb-ai-btn-sm" data-ai-action="cgpa_calc" data-ai-param="8.0"><i class="fas fa-calculator"></i> Calculate 8.0 CGPA Goal</button>
        </div>
      </div>
    `;
  }

  function formatPromotionResponse(student) {
    const rep = analyzePromotion(student);
    if (!rep.ok) return `<p>${rep.error}</p>`;

    const statusBadge =
      rep.status === "SAFE"
        ? '<span class="bb-ai-card-badge bb-badge-success">🟢 Eligible / Safe</span>'
        : rep.status === "BORDERLINE"
        ? '<span class="bb-ai-card-badge bb-badge-warning">🟡 Borderline</span>'
        : '<span class="bb-ai-card-badge bb-badge-danger">🔴 Detention Risk</span>';

    const progPercent = Math.min(100, Math.round((rep.creditsApplicable / rep.requiredCredits) * 100));

    return `
      <div class="bb-ai-card">
        <div class="bb-ai-card-header">
          <span class="bb-ai-card-title"><i class="fas fa-shield-alt text-green-400"></i> Promotion & Credits Check</span>
          ${statusBadge}
        </div>

        <p class="text-xs mb-2">
          <strong>Rule:</strong> ${rep.ruleText}
        </p>

        <div class="bb-ai-prog-wrap">
          <div class="bb-ai-prog-labels">
            <span>Credits Secured: <strong>${rep.creditsApplicable}</strong></span>
            <span>Required: <strong>${rep.requiredCredits}</strong></span>
          </div>
          <div class="bb-ai-prog-track">
            <div class="bb-ai-prog-fill ${rep.status === "SAFE" ? "bg-green-500" : rep.status === "BORDERLINE" ? "bg-yellow-500" : "bg-red-500"}" style="width: ${progPercent}%;"></div>
          </div>
        </div>

        <p class="text-xs mt-2">
          ${
            rep.status === "SAFE"
              ? `✅ You are <strong>${rep.margin} credits above</strong> the minimum promotion requirement! You are safely promoted without any credit detention risk.`
              : rep.status === "BORDERLINE"
              ? `⚠️ You are <strong>only ${rep.margin} credits above</strong> the detention cutoff. Make sure you don't accumulate more backlogs!`
              : `🚨 <strong>Action Needed:</strong> You are short by <strong>${Math.abs(rep.margin)} credits</strong>. You must clear pending supplies before the promotion deadline to avoid credit detention.`
          }
        </p>

        <div class="bb-ai-inline-actions">
          <button class="bb-ai-btn-sm" data-ai-action="page_credit"><i class="fas fa-external-link-alt"></i> Open Full Credit Checker</button>
        </div>
      </div>
    `;
  }

  function formatRevaluationResponse(student) {
    const rep = analyzeRevaluation(student);
    if (!rep.ok) return `<p>${rep.error}</p>`;

    if (!rep.hasSupplies) {
      return `
        <div class="bb-ai-card">
          <div class="bb-ai-card-header">
            <span class="bb-ai-card-title"><i class="fas fa-info-circle text-blue-400"></i> Revaluation (RC/RV)</span>
            <span class="bb-ai-card-badge bb-badge-success">Not Required</span>
          </div>
          <p class="text-xs">${rep.message}</p>
        </div>
      `;
    }

    const cardsHtml = rep.recommendations
      .map(
        (r) => `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 8px 10px; margin-bottom: 6px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong class="text-white text-xs">${r.name}</strong>
          <span class="bb-ai-card-badge ${r.badgeClass}">${r.verdict}</span>
        </div>
        <p class="text-[11px] text-zinc-300 mt-1 mb-0">${r.advice}</p>
      </div>
    `
      )
      .join("");

    return `
      <div class="bb-ai-card">
        <div class="bb-ai-card-header">
          <span class="bb-ai-card-title"><i class="fas fa-file-signature text-purple-400"></i> Should You Apply for RC/RV?</span>
          <span class="bb-ai-card-badge bb-badge-info">AI Assessment</span>
        </div>

        <p class="text-xs mb-2">
          JNTUH RC/RV fees are approx <strong>₹1,000 per subject</strong>. Here is our data-backed advice on whether to apply:
        </p>

        ${cardsHtml}

        <div class="bb-ai-alert bb-ai-alert-tip">
          💡 <em>Pro Tip:</em> JNTUH revaluation rarely increases marks by more than 4-5 marks. If your external score is under 20, investing in a supplementary exam attempt has a 4x higher probability of success.
        </div>
      </div>
    `;
  }

  function formatRoadmapResponse() {
    return `
      <div class="bb-ai-card">
        <div class="bb-ai-card-header">
          <span class="bb-ai-card-title"><i class="fas fa-lightbulb text-yellow-400"></i> Supply Clearing Blueprint</span>
          <span class="bb-ai-card-badge bb-badge-warning">5-Step Method</span>
        </div>

        <div class="text-xs space-y-2">
          <div>
            <strong class="text-yellow-400">1. Master 2.5 to 3 Units Only:</strong>
            <p class="text-zinc-300 m-0">JNTUH question papers provide internal choice for all 5 units. Perfecting 3 complete units guarantees answering 3 out of 5 questions = 45/75 marks (well above the 26 pass mark!).</p>
          </div>
          <div>
            <strong class="text-yellow-400">2. Previous 3-Years Supply Papers:</strong>
            <p class="text-zinc-300 m-0">60-70% of JNTUH questions repeat from previous regular and supply papers of the same regulation (R18/R22). Solve them first.</p>
          </div>
          <div>
            <strong class="text-yellow-400">3. Neat Block Diagrams & Step Marking:</strong>
            <p class="text-zinc-300 m-0">Examiners spend less than 2 minutes evaluating a script. Always include bold headings, bullet points, and neat pencil diagrams to earn step marks.</p>
          </div>
          <div>
            <strong class="text-yellow-400">4. Internal Mark Calculation:</strong>
            <p class="text-zinc-300 m-0">Check your internal marks. If you have 20 internal marks, you only need 26 external to pass with 46 total!</p>
          </div>
        </div>
      </div>
    `;
  }

  function formatAuditResponse(student) {
    const supplies = analyzeSupplies(student);
    const improvements = analyzeImprovements(student);
    const promo = analyzePromotion(student);
    const profile = getStudentAcademicProfile(student.hallTicket);
    const firstName = getStudentFirstName(student.name);

    // Calculate current CGPA based on student's regulation
    const cgpa = calculateStudentCGPA(student);
    const totalCredits = promo.totalEarnedCredits;

    return `
      <div class="bb-ai-card">
        <div class="bb-ai-card-header">
          <span class="bb-ai-card-title"><i class="fas fa-user-graduate text-yellow-400"></i> Full Academic Audit</span>
          <span class="bb-ai-card-badge bb-badge-info">${student.hallTicket || "Student"}</span>
        </div>

        <div class="text-xs text-zinc-400 mb-2">
          Candidate: <strong class="text-white">${firstName}</strong> • Regulation: <strong class="text-yellow-400">${profile.regulation}</strong> • ${profile.entryType}
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
          <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:8px; text-align:center;">
            <div class="text-[10px] text-zinc-400 uppercase">Current CGPA</div>
            <div class="text-xl font-black text-yellow-400">${cgpa}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:8px; text-align:center;">
            <div class="text-[10px] text-zinc-400 uppercase">Credits Earned</div>
            <div class="text-xl font-black text-white">${totalCredits} / ${profile.totalDegreeCredits}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:8px; text-align:center;">
            <div class="text-[10px] text-zinc-400 uppercase">Active Backlogs</div>
            <div class="text-xl font-black ${supplies.totalActive > 0 ? "text-red-400" : "text-green-400"}">${supplies.totalActive}</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:8px; text-align:center;">
            <div class="text-[10px] text-zinc-400 uppercase">Promotion Status</div>
            <div class="text-xs font-black ${promo.status === "SAFE" ? "text-green-400" : "text-red-400"} mt-1">${promo.status}</div>
          </div>
        </div>

        <div class="bb-ai-inline-actions">
          <button class="bb-ai-btn-sm" data-ai-action="supplies"><i class="fas fa-exclamation-circle"></i> View Supplies</button>
          <button class="bb-ai-btn-sm" data-ai-action="improvements"><i class="fas fa-chart-line"></i> Improvement Areas</button>
          <button class="bb-ai-btn-sm" data-ai-action="nav_list"><i class="fas fa-folder-open"></i> Semesters</button>
          <button class="bb-ai-btn-sm" data-ai-action="grace_marks"><i class="fas fa-graduation-cap"></i> Grace Marks</button>
          <button class="bb-ai-btn-sm" data-ai-action="placements"><i class="fas fa-briefcase"></i> Placements Scan</button>
          <button class="bb-ai-btn-sm" data-ai-action="print_audit"><i class="fas fa-print"></i> Print Report</button>
        </div>
      </div>
    `;
  }

  function formatGraceMarksResponse(student) {
    const gm = analyzeGraceMarks(student);
    if (!gm.ok) return `<p>${gm.error}</p>`;

    let statusBadge = "";
    let message = "";

    if (gm.theorySupplies.length === 0) {
      statusBadge = `<span class="bb-ai-card-badge bb-badge-success">All Clear</span>`;
      message = `<p class="text-xs text-green-400 font-bold">🎉 You have zero failed theory subjects! You do not require Grace Marks or Exemption.</p>`;
    } else if (gm.labSupplies.length > 0) {
      statusBadge = `<span class="bb-ai-card-badge bb-badge-danger">Labs Ineligible</span>`;
      message = `
        <p class="text-xs mb-2">
          ⚠️ <strong>Important JNTUH Rule:</strong> Grace marks apply <strong>strictly to theory subjects</strong>. You have <strong>${gm.labSupplies.length} failed lab/practical subjects</strong>, which must be cleared via supplementary exams before claiming grace marks.
        </p>
      `;
    } else if (gm.isEligibleByMarks) {
      statusBadge = `<span class="bb-ai-card-badge bb-badge-success">Eligible for Grace Marks</span>`;
      message = `
        <p class="text-xs text-green-400 font-bold mb-2">
          🟢 <strong>Great news!</strong> Your failed theory subjects require only <strong>${gm.totalShortfall} marks</strong> total to reach passing marks, which is within the JNTUH 0.15% limit (Max: ${gm.maxGraceMarks} marks)!
        </p>
        <p class="text-xs text-zinc-300">
          Upon completing your 4th year, you can submit the JNTUH Grace Marks undertaking form at your exam branch to clear these subjects and receive your Provisional Certificate (PC) & CMM!
        </p>
      `;
    } else {
      statusBadge = `<span class="bb-ai-card-badge bb-badge-warning">Shortfall Exceeds Limit</span>`;
      message = `
        <p class="text-xs mb-2">
          You need <strong>${gm.totalShortfall} marks</strong> total across your theory supplies to pass (need 26 external / 40 total). The JNTUH maximum grace marks limit is <strong>${gm.maxGraceMarks} marks</strong>.
        </p>
        <p class="text-xs text-yellow-300">
          👉 <strong>Strategy:</strong> Clear 1 or 2 subjects in upcoming supply exams to bring your total mark deficit below ${gm.maxGraceMarks} marks, after which you can claim grace marks for the rest!
        </p>
      `;
    }

    let exemptionNote = "";
    if (gm.regulation === "R18" || gm.regulation === "R16") {
      exemptionNote = `
        <div class="bb-ai-alert bb-ai-alert-tip mt-2">
          <strong>📜 ${gm.regulation} Subject Exemption Rule:</strong> Students who secured $\\ge 154$ credits out of 160 can exempt up to <strong>2 theory elective subjects (max 6 credits)</strong>!
          ${gm.canExempt ? `<br><span class="text-green-400 font-bold">✅ You have ${gm.earnedCredits} credits and qualify for exemption!</span>` : `<br><span>Current earned: ${gm.earnedCredits}/154 required for exemption.</span>`}
        </div>
      `;
    } else {
      exemptionNote = `
        <div class="bb-ai-alert bb-ai-alert-tip mt-2">
          <strong>📜 R22 Regulation Rule:</strong> Note that in R22 regulation, JNTUH has <strong>removed subject exemption</strong>. All 160 credits must be secured to graduate.
        </div>
      `;
    }

    return `
      <div class="bb-ai-card">
        <div class="bb-ai-card-header">
          <span class="bb-ai-card-title"><i class="fas fa-graduation-cap text-pink-400"></i> Grace Marks & Exemption Checker</span>
          ${statusBadge}
        </div>

        <div class="text-xs text-zinc-400 mb-2">
          Regulation: <strong class="text-white">${gm.regulation}</strong> • Theory Backlogs: <strong class="text-white">${gm.theorySupplies.length}</strong> • Max Grace Allowed: <strong class="text-yellow-400">${gm.maxGraceMarks} Marks</strong>
        </div>

        ${message}
        ${exemptionNote}

        <div class="bb-ai-inline-actions">
          <button class="bb-ai-btn-sm" data-ai-action="prep_strategy"><i class="fas fa-lightbulb"></i> Supply Strategy</button>
        </div>
      </div>
    `;
  }

  function formatPlacementsResponse(student) {
    const p = analyzePlacements(student);
    if (!p.ok) return `<p>${p.error}</p>`;

    const massBadge = p.massEligible
      ? `<span class="bb-ai-card-badge bb-badge-success">Eligible</span>`
      : `<span class="bb-ai-card-badge bb-badge-danger">Unmet</span>`;

    const prodBadge = p.productEligible
      ? `<span class="bb-ai-card-badge bb-badge-success">Eligible</span>`
      : `<span class="bb-ai-card-badge bb-badge-warning">Backlogs Pending</span>`;

    const gateBadge = p.higherStudiesEligible
      ? `<span class="bb-ai-card-badge bb-badge-success">Eligible</span>`
      : `<span class="bb-ai-card-badge bb-badge-warning">Needs 6.5+</span>`;

    return `
      <div class="bb-ai-card">
        <div class="bb-ai-card-header">
          <span class="bb-ai-card-title"><i class="fas fa-briefcase text-emerald-400"></i> Placements & Career Readiness</span>
          <span class="bb-ai-card-badge bb-badge-info">CGPA: ${p.cgpa}</span>
        </div>

        <p class="text-xs mb-2">
          Career eligibility based on your current CGPA (<strong>${p.cgpa}</strong>) and active backlogs (<strong>${p.activeBacklogs}</strong>):
        </p>

        <div class="bb-ai-placement-grid">
          <div class="bb-ai-placement-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong class="text-white text-xs">Mass IT Recruiters</strong>
              ${massBadge}
            </div>
            <p class="text-[10px] text-zinc-400 mt-1 mb-0">TCS, Infosys, Cognizant, Wipro, Accenture (Req: 60% / 6.0 CGPA, $\\le 1$ backlog).</p>
          </div>

          <div class="bb-ai-placement-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong class="text-white text-xs">Tier-1 & Product</strong>
              ${prodBadge}
            </div>
            <p class="text-[10px] text-zinc-400 mt-1 mb-0">Amazon, Cisco, Service Digital (Req: 7.0+ CGPA, 0 active backlogs).</p>
          </div>

          <div class="bb-ai-placement-card" style="grid-column: span 2;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong class="text-white text-xs">Higher Studies / GATE / MS Abroad</strong>
              ${gateBadge}
            </div>
            <p class="text-[10px] text-zinc-400 mt-1 mb-0">US/Germany Universities & PSU through GATE (Req: 6.5–7.0+ CGPA, 0 backlogs on graduation).</p>
          </div>
        </div>

        <div class="bb-ai-alert bb-ai-alert-tip">
          ${
            p.activeBacklogs > 0
              ? `💡 <strong>Action Priority:</strong> Clear your <strong>${p.activeBacklogs} pending backlog(s)</strong> before 7th semester campus drives start, which unlocks 90% of company eligibility criteria!`
              : `🌟 <strong>Clean Record:</strong> You have 0 active backlogs! Focus on Data Structures, System Design, and Projects to crack high-package campus offers.`
          }
        </div>

        <div class="bb-ai-inline-actions">
          <button class="bb-ai-btn-sm" data-ai-action="simulator"><i class="fas fa-gamepad"></i> Simulate CGPA</button>
        </div>
      </div>
    `;
  }

  function formatWhatIfSimulator(student) {
    const supReport = analyzeSupplies(student);
    const activeList = supReport.activeSupplies.slice(0, 4);

    let currentEarned = 0;
    let currentPoints = 0;
    (student.semesters || []).forEach((sem) => {
      (sem.subjects || []).forEach((sub) => {
        const gp = GRADE_POINTS[sub.grade] ?? 0;
        const cr = parseFloat(sub.credits || 0);
        if (gp > 0) {
          currentEarned += cr;
          currentPoints += gp * cr;
        }
      });
    });
    const curCgpa = currentEarned === 0 ? "0.00" : (currentPoints / currentEarned).toFixed(2);

    let backlogSelectors = "";
    if (activeList.length > 0) {
      backlogSelectors = activeList
        .map(
          (s, idx) => `
        <div class="bb-ai-sim-row">
          <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            <strong class="text-white">${s.name}</strong>
            <span class="text-[9px] text-zinc-400 block">${s.credits} Cr • ${s.semester}</span>
          </div>
          <select class="bb-ai-sim-select" data-sim-cr="${s.credits}" id="sim-backlog-${idx}">
            <option value="10">O (10 GP)</option>
            <option value="9">A+ (9 GP)</option>
            <option value="8" selected>A (8 GP)</option>
            <option value="7">B+ (7 GP)</option>
            <option value="6">B (6 GP)</option>
            <option value="5">C (5 GP)</option>
          </select>
        </div>
      `
        )
        .join("");
    } else {
      backlogSelectors = `<p class="text-xs text-green-400 font-bold mb-2">🎉 No active backlogs! Simulating upcoming semester below:</p>`;
    }

    return `
      <div class="bb-ai-card" id="bb-ai-sim-container" data-base-earned="${currentEarned}" data-base-points="${currentPoints}">
        <div class="bb-ai-card-header">
          <span class="bb-ai-card-title"><i class="fas fa-gamepad text-indigo-400"></i> What-If CGPA Simulator</span>
          <span class="bb-ai-card-badge bb-badge-info">Interactive Sandbox</span>
        </div>

        <p class="text-xs mb-2">
          Select prospective grades to see your projected CGPA update in real-time:
        </p>

        ${activeList.length > 0 ? `<div class="text-[10px] uppercase font-bold text-yellow-500 mb-1">1. Projected Supply Exam Grades:</div>` : ""}
        ${backlogSelectors}

        <div class="text-[10px] uppercase font-bold text-yellow-500 mt-2 mb-1">2. Upcoming Semester Target:</div>
        <div class="bb-ai-sim-row">
          <div style="flex:1;">
            <strong class="text-white">Next Semester (20 Credits)</strong>
            <span class="text-[9px] text-zinc-400 block">Estimated SGPA</span>
          </div>
          <select class="bb-ai-sim-select" data-sim-cr="20" id="sim-upcoming">
            <option value="9.5">9.5 SGPA (Outstanding)</option>
            <option value="8.5" selected>8.5 SGPA (Excellent)</option>
            <option value="7.5">7.5 SGPA (Good)</option>
            <option value="6.5">6.5 SGPA (Average)</option>
          </select>
        </div>

        <div class="bb-ai-sim-output" id="bb-ai-sim-result">
          <div class="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Projected CGPA</div>
          <div class="flex items-center justify-center gap-3 mt-1">
            <span class="text-xs text-zinc-500 line-through">${curCgpa}</span>
            <i class="fas fa-arrow-right text-yellow-accent text-xs"></i>
            <span class="text-2xl font-black text-yellow-accent" id="bb-ai-sim-cgpa-val">--</span>
          </div>
          <div class="text-[10px] font-bold text-green-400 mt-1" id="bb-ai-sim-boost-text">Simulating...</div>
        </div>
      </div>
    `;
  }

  function updateWhatIfCalculation() {
    const container = document.getElementById("bb-ai-sim-container");
    if (!container) return;

    const baseEarned = parseFloat(container.dataset.baseEarned) || 0;
    const basePoints = parseFloat(container.dataset.basePoints) || 0;

    let addedCredits = 0;
    let addedPoints = 0;

    container.querySelectorAll(".bb-ai-sim-select").forEach((sel) => {
      const cr = parseFloat(sel.dataset.simCr) || 0;
      const val = parseFloat(sel.value) || 0;
      addedCredits += cr;
      addedPoints += val * cr;
    });

    const newTotalCredits = baseEarned + addedCredits;
    const newTotalPoints = basePoints + addedPoints;
    const newCgpa = newTotalCredits === 0 ? "0.00" : (newTotalPoints / newTotalCredits).toFixed(2);
    const oldCgpa = baseEarned === 0 ? "0.00" : (basePoints / baseEarned).toFixed(2);
    const boost = (parseFloat(newCgpa) - parseFloat(oldCgpa)).toFixed(2);

    const cgpaEl = document.getElementById("bb-ai-sim-cgpa-val");
    const boostEl = document.getElementById("bb-ai-sim-boost-text");

    if (cgpaEl) cgpaEl.innerText = newCgpa;
    if (boostEl) {
      if (parseFloat(boost) > 0) {
        boostEl.innerText = `🚀 Projected Jump: +${boost} CGPA points!`;
        boostEl.className = "text-[10px] font-bold text-green-400 mt-1";
      } else {
        boostEl.innerText = `Projected: ${newCgpa} CGPA`;
        boostEl.className = "text-[10px] font-bold text-yellow-400 mt-1";
      }
    }
  }

  function formatNotesResponse(student) {
    const supplies = analyzeSupplies(student);
    const subs = supplies.activeSupplies.slice(0, 3);

    let subLinks = "";
    if (subs.length > 0) {
      subLinks = subs
        .map(
          (s) => `
        <div class="bb-ai-sim-row">
          <div>
            <strong class="text-white">${s.name}</strong>
            <span class="text-[9px] text-zinc-400 block">${s.code} • ${s.semester}</span>
          </div>
          <a href="https://btech-notes.vercel.app" target="_blank" class="bb-ai-btn-sm" style="text-decoration:none;">
            <i class="fas fa-file-pdf"></i> Get Notes
          </a>
        </div>
      `
        )
        .join("");
    }

    return `
      <div class="bb-ai-card">
        <div class="bb-ai-card-header">
          <span class="bb-ai-card-title"><i class="fas fa-book-open text-orange-400"></i> BTech Notes & Study Material</span>
          <span class="bb-ai-card-badge bb-badge-info">Free Access</span>
        </div>

        <p class="text-xs mb-2">
          Access comprehensive unit-wise notes, previous question papers, and important questions directly:
        </p>

        ${subLinks}

        <div class="bb-ai-alert bb-ai-alert-tip mt-2">
          📺 <strong>Top Recommended YouTube Channels for JNTUH:</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>Mathematics / Engineering Core:</strong> Gate Smashers, Neso Academy</li>
            <li><strong>Programming & CSE:</strong> Abdul Bari, Knowledge Gate</li>
            <li><strong>JNTUH Question Paper Reviews:</strong> All About JNTUH</li>
          </ul>
        </div>

        <div class="bb-ai-inline-actions">
          <a href="https://btech-notes.vercel.app" target="_blank" class="bb-ai-btn-sm" style="text-decoration:none;">
            <i class="fas fa-external-link-alt"></i> Open Full Notes Portal
          </a>
        </div>
      </div>
    `;
  }

  function getWelcomeMessage() {
    return `
      <p>👋 <strong>Hello! I am Backbenchers AI</strong>, your automated JNTUH academic assistant.</p>
      <p>Here is what I can do for you:</p>
      <ul>
        <li>⚠️ <strong>Active supplies & failure root cause</strong></li>
        <li>📈 <strong>Subjects to improve</strong> for high CGPA boost</li>
        <li>🛡️ <strong>Credit check & promotion eligibility</strong> (detention risk)</li>
        <li>🎓 <strong>Grace marks & subject exemption eligibility</strong></li>
        <li>🎮 <strong>Interactive What-If CGPA simulator</strong></li>
        <li>💼 <strong>Campus placement & career readiness scan</strong></li>
        <li>🎯 <strong>Target CGPA solver</strong> (required SGPA)</li>
        <li>📚 <strong>BTech study notes & YouTube links</strong></li>
      </ul>
      <p class="text-xs text-yellow-300 font-bold">
        🎙️ Type or speak your Hall Ticket number or click any quick action above!
      </p>
    `;
  }

  /* ==========================================================================
     MESSAGE HANDLING & NLP QUERY ROUTING
     ========================================================================== */

  function handleUserSend() {
    const input = document.getElementById("bb-ai-input");
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    addUserMessage(text);
    processUserQuery(text);
  }

  async function processUserQuery(query) {
    const qLower = query.toLowerCase();

    // 1. Check if user typed or mentioned a Hall Ticket number
    const htExtracted = extractHallTicket(query);
    if (htExtracted) {
      addUserMessage(query, false); // in case called from chip
      await fetchStudentResult(htExtracted, true);
      return;
    }

    // If query asks for student-specific info without student loaded
    if (!state.currentStudent) {
      // Try to grab from DOM or FULL_RESULT
      checkForPageStudent();
      if (!state.currentStudent) {
        addBotMessage(
          `🔍 To analyze your supplies and improvement areas, please enter your <strong>10-digit Hall Ticket Number</strong> (e.g. <code>21071A0501</code>):`
        );
        return;
      }
    }

    const student = state.currentStudent;

    // 2. Intent Routing

    // Supplies / Backlogs
    if (
      qLower.includes("suppl") ||
      qLower.includes("backlog") ||
      qLower.includes("fail") ||
      qLower.includes("pending") ||
      qLower.includes("arrear")
    ) {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addBotMessage(formatSuppliesResponse(student));
      }, 400);
      return;
    }

    // Improvement
    if (
      qLower.includes("improv") ||
      qLower.includes("low mark") ||
      qLower.includes("weak") ||
      qLower.includes("penchali") ||
      qLower.includes("which subject")
    ) {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addBotMessage(formatImprovementResponse(student));
      }, 400);
      return;
    }

    // Promotion / Credits
    if (
      qLower.includes("promot") ||
      qLower.includes("detent") ||
      qLower.includes("credit") ||
      qLower.includes("safe") ||
      qLower.includes("eligible")
    ) {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addBotMessage(formatPromotionResponse(student));
      }, 400);
      return;
    }

    // RC/RV Revaluation
    if (
      qLower.includes("revalu") ||
      qLower.includes("rc") ||
      qLower.includes("rv") ||
      qLower.includes("recount") ||
      qLower.includes("challenge")
    ) {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addBotMessage(formatRevaluationResponse(student));
      }, 400);
      return;
    }

    // Strategy / Roadmap
    if (
      qLower.includes("strategy") ||
      qLower.includes("roadmap") ||
      qLower.includes("clear") ||
      qLower.includes("tips") ||
      qLower.includes("prepare") ||
      qLower.includes("how to pass") ||
      qLower.includes("pass ela") ||
      qLower.includes("kaise pass")
    ) {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addBotMessage(formatRoadmapResponse());
      }, 400);
      return;
    }

    // Grace Marks & Subject Exemption
    if (
      qLower.includes("grace") ||
      qLower.includes("exempt") ||
      qLower.includes("grace mark") ||
      qLower.includes("subject exemption") ||
      qLower.includes("vastaya")
    ) {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addBotMessage(formatGraceMarksResponse(student));
      }, 400);
      return;
    }

    // What-If Simulator
    if (
      qLower.includes("simulat") ||
      qLower.includes("what if") ||
      qLower.includes("predict") ||
      qLower.includes("sandbox")
    ) {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addBotMessage(formatWhatIfSimulator(student));
        setTimeout(updateWhatIfCalculation, 60);
      }, 400);
      return;
    }

    // Placements & Career Readiness
    if (
      qLower.includes("place") ||
      qLower.includes("job") ||
      qLower.includes("career") ||
      qLower.includes("campus") ||
      qLower.includes("tcs") ||
      qLower.includes("infosys") ||
      qLower.includes("gate")
    ) {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addBotMessage(formatPlacementsResponse(student));
      }, 400);
      return;
    }

    // Semester Navigation queries (e.g. "show 1-1", "go to 2-1", "open 3-2", "semesters", "all semesters")
    const semMatch = query.match(/\b([1-4]-[1-2]|all)\b/i);
    if (
      semMatch ||
      qLower.includes("navigate") ||
      qLower.includes("semesters") ||
      qLower.includes("open sem") ||
      qLower.includes("show sem") ||
      qLower.includes("go to sem") ||
      qLower.includes("switch sem")
    ) {
      const targetSem = semMatch ? semMatch[1].toUpperCase() : null;
      if (targetSem) {
        showTyping();
        setTimeout(() => {
          hideTyping();
          const res = navigateToSemester(targetSem);
          if (res.success && !res.redirect) {
            addBotMessage(`✅ Navigated to <strong>Semester ${targetSem}</strong> results on the page! Scrolled into view.`);
          } else if (res.redirect) {
            addBotMessage(`🚀 Opening <strong>Semester ${targetSem}</strong> results for ${student.hallTicket}...`);
          } else {
            addBotMessage(`⚠️ Semester ${targetSem} not found in your current results.<br>` + formatSemesterNavigationList(student));
          }
        }, 400);
        return;
      } else {
        showTyping();
        setTimeout(() => {
          hideTyping();
          addBotMessage(formatSemesterNavigationList(student));
        }, 400);
        return;
      }
    }

    // Specific Subject Study Notes & YouTube queries (e.g. "Notes for M1", "YouTube links for OS")
    const isNotesQuery = qLower.includes("note") || qLower.includes("material") || qLower.includes("syllabus") || qLower.includes("pdf");
    const isVideoQuery = qLower.includes("youtube") || qLower.includes("video") || qLower.includes("lecture") || qLower.includes("playlist");
    if (isNotesQuery || isVideoQuery) {
      let matchedSubject = null;
      if (student && Array.isArray(student.semesters)) {
        for (const sem of student.semesters) {
          for (const sub of (sem.subjects || [])) {
            const name = (sub.subjectName || sub.name || "").toLowerCase();
            const code = (sub.subjectCode || sub.code || "").toLowerCase();
            const words = name.split(/[\s-]+/).filter((w) => w.length > 2);
            if (qLower.includes(name) || (code && qLower.includes(code)) || words.some((w) => qLower.includes(w))) {
              matchedSubject = sub;
              break;
            }
          }
          if (matchedSubject) break;
        }
      }

      if (matchedSubject) {
        showTyping();
        setTimeout(() => {
          hideTyping();
          addBotMessage(formatSubjectSearchHub(matchedSubject.subjectName || matchedSubject.name, matchedSubject.subjectCode || matchedSubject.code));
        }, 400);
        return;
      }

      const cleanSubQuery = query.replace(/(notes|for|youtube|links|video|lectures|playlist|in|telugu|materials|pdf|jntuh|search)/gi, "").trim();
      if (cleanSubQuery.length >= 2) {
        showTyping();
        setTimeout(() => {
          hideTyping();
          addBotMessage(formatSubjectSearchHub(cleanSubQuery));
        }, 400);
        return;
      }

      showTyping();
      setTimeout(() => {
        hideTyping();
        addBotMessage(formatNotesResponse(student));
      }, 400);
      return;
    }

    // Tanglish / Hinglish queries ("naku enni supplies unnai", "kitne supply bache hai")
    if (qLower.includes("enni") || qLower.includes("unnai") || qLower.includes("kitne") || qLower.includes("bache")) {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addBotMessage(`<p class="text-yellow-400 font-bold mb-1">Bro, no tension! Here is your complete active backlog status:</p>` + formatSuppliesResponse(student));
      }, 400);
      return;
    }

    // Full Audit
    if (qLower.includes("audit") || qLower.includes("overview") || qLower.includes("summary") || qLower.includes("report")) {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addBotMessage(formatAuditResponse(student));
      }, 400);
      return;
    }

    // Target CGPA calculation
    const cgpaMatch = query.match(/(\d\.\d|\d)/);
    if (qLower.includes("cgpa") || qLower.includes("sgpa") || qLower.includes("target") || cgpaMatch) {
      const targetVal = cgpaMatch ? parseFloat(cgpaMatch[0]) : 7.5;
      if (targetVal >= 4 && targetVal <= 10) {
        showTyping();
        setTimeout(() => {
          hideTyping();
          const calc = calculateTargetCgpa(student, targetVal);
          if (!calc.ok) {
            addBotMessage(calc.error);
            return;
          }

          addBotMessage(`
            <div class="bb-ai-card">
              <div class="bb-ai-card-header">
                <span class="bb-ai-card-title"><i class="fas fa-bullseye text-blue-400"></i> Target CGPA Calculator</span>
                <span class="bb-ai-card-badge bb-badge-info">Target: ${calc.targetGoal}</span>
              </div>
              <p class="text-xs mb-2">
                Current CGPA: <strong>${calc.currentCgpa}</strong> (${calc.earnedCredits} credits completed, ${calc.remainingCredits} remaining out of ${calc.totalCreditsNeeded}).
              </p>
              <div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:10px; text-align:center; margin:8px 0;">
                <div class="text-[10px] text-zinc-400">Required SGPA per remaining semester:</div>
                <div class="text-2xl font-black ${calc.isFeasible ? "text-yellow-400" : "text-red-400"}">${calc.requiredSGPA}</div>
              </div>
              <p class="text-xs">
                ${
                  calc.isFeasible
                    ? `🎯 <strong>Achievable!</strong> Maintain an average SGPA of <strong>${calc.requiredSGPA}</strong> in the remaining semesters to reach your target of ${calc.targetGoal} CGPA.`
                    : `⚠️ <strong>Mathematically Tough:</strong> To reach ${calc.targetGoal}, you would need ${calc.requiredSGPA} SGPA (max possible is 10.0). The maximum achievable CGPA is <strong>${calc.maxAchievableCgpa}</strong>.`
                }
              </p>
            </div>
          `);
        }, 400);
        return;
      }
    }

    // Try calling AI backend proxy for open-ended queries
    await callAiBackend(query, student);
  }

  async function callAiBackend(query, student) {
    showTyping();
    try {
      const response = await fetch(CONFIG.aiProxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          student: student
            ? {
                hallTicket: student.hallTicket,
                name: student.name,
                branch: student.branch,
                semesters: student.semesters
              }
            : null
        })
      });

      const data = await response.json();
      hideTyping();

      if (data && data.ok && data.reply) {
        addBotMessage(data.reply);
      } else {
        fallbackAcademicResponse(query);
      }
    } catch (err) {
      hideTyping();
      fallbackAcademicResponse(query);
    }
  }

  function fallbackAcademicResponse(query) {
    addBotMessage(`
      <p>I can help you with specific academic tasks for JNTUH results! You can ask:</p>
      <ul>
        <li>👉 <em>"Show Semester 2-1 results"</em></li>
        <li>👉 <em>"Notes and YouTube links for Mathematics"</em></li>
        <li>👉 <em>"How many supplies do I have?"</em></li>
        <li>👉 <em>"In which subjects can I improve my score?"</em></li>
        <li>👉 <em>"Am I eligible for Grace Marks?"</em></li>
        <li>👉 <em>"Simulate my CGPA in sandbox"</em></li>
      </ul>
      <p class="text-xs text-zinc-400">Try one of the quick options above or click a chip!</p>
    `);
  }

  function handleInlineAction(action, param, btn) {
    const student = state.currentStudent;
    if (!student) {
      promptForHallTicket();
      return;
    }

    if (action === "supplies") {
      addBotMessage(formatSuppliesResponse(student));
    } else if (action === "improvements") {
      addBotMessage(formatImprovementResponse(student));
    } else if (action === "promotion") {
      addBotMessage(formatPromotionResponse(student));
    } else if (action === "rcrv") {
      addBotMessage(formatRevaluationResponse(student));
    } else if (action === "prep_strategy") {
      addBotMessage(formatRoadmapResponse());
    } else if (action === "grace_marks") {
      addBotMessage(formatGraceMarksResponse(student));
    } else if (action === "simulator") {
      addBotMessage(formatWhatIfSimulator(student));
      setTimeout(updateWhatIfCalculation, 60);
    } else if (action === "placements") {
      addBotMessage(formatPlacementsResponse(student));
    } else if (action === "notes") {
      addBotMessage(formatNotesResponse(student));
    } else if (action === "audit") {
      addBotMessage(formatAuditResponse(student));
    } else if (action === "nav_list") {
      addBotMessage(formatSemesterNavigationList(student));
    } else if (action === "nav_sem") {
      const res = navigateToSemester(param);
      if (res.success && !res.redirect) {
        addBotMessage(`✅ Navigated to <strong>Semester ${param}</strong> on the page! Scrolled results into view.`);
      } else if (res.redirect) {
        addBotMessage(`🚀 Opening <strong>Semester ${param}</strong> results...`);
      } else {
        addBotMessage(`⚠️ Could not navigate to Semester ${param}. Try selecting it directly on the results page.`);
      }
    } else if (action === "search_subject") {
      const code = (btn && btn.dataset && btn.dataset.aiCode) || "";
      addBotMessage(formatSubjectSearchHub(param, code));
    } else if (action === "print_audit") {
      window.print();
    } else if (action === "cgpa_calc") {
      const val = parseFloat(param) || 7.5;
      processUserQuery(`calculate target cgpa ${val}`);
    } else if (action === "page_backlog") {
      window.location.href = `/backlog?ht=${student.hallTicket}`;
    } else if (action === "page_credit") {
      window.location.href = `/creditChecker?ht=${student.hallTicket}`;
    }
  }

  function initVoiceInput() {
    const micBtn = document.getElementById("bb-ai-btn-mic");
    const input = document.getElementById("bb-ai-input");
    if (!micBtn || !input) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      micBtn.title = "Voice search not supported on this browser";
      micBtn.style.opacity = "0.5";
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    micBtn.addEventListener("click", () => {
      if (micBtn.classList.contains("bb-ai-mic-active")) {
        recognition.stop();
        micBtn.classList.remove("bb-ai-mic-active");
      } else {
        try {
          recognition.start();
          micBtn.classList.add("bb-ai-mic-active");
        } catch (err) {
          console.error("Speech recognition start error:", err);
        }
      }
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      micBtn.classList.remove("bb-ai-mic-active");
      handleUserSend();
    };

    recognition.onerror = () => {
      micBtn.classList.remove("bb-ai-mic-active");
    };

    recognition.onend = () => {
      micBtn.classList.remove("bb-ai-mic-active");
    };
  }

  /* ==========================================================================
     UI HELPERS & CHAT ACTIONS
     ========================================================================== */

  function toggleChat() {
    if (state.isOpen) closeChat();
    else openChat();
  }

  function openChat() {
    const win = document.getElementById("bb-ai-window");
    if (!win) return;
    win.classList.add("bb-ai-open");
    state.isOpen = true;

    // Focus input on desktop
    if (window.innerWidth > 640) {
      setTimeout(() => document.getElementById("bb-ai-input")?.focus(), 300);
    }
  }

  function closeChat() {
    const win = document.getElementById("bb-ai-window");
    if (!win) return;
    win.classList.remove("bb-ai-open");
    state.isOpen = false;
  }

  function clearChat() {
    const feed = document.getElementById("bb-ai-messages-feed");
    if (feed) feed.innerHTML = "";
    addBotMessage(getWelcomeMessage());
  }

  function promptForHallTicket() {
    const ht = prompt("Enter 10-digit JNTUH Hall Ticket Number (e.g. 21071A0501):");
    if (ht && isHallTicket(ht.trim())) {
      fetchStudentResult(ht.trim(), true);
    } else if (ht) {
      alert("Invalid Hall Ticket Number format. Expected 10 alphanumeric characters (e.g. 21071A0501).");
    }
  }

  function showTyping() {
    const el = document.getElementById("bb-ai-typing-container");
    if (el) {
      el.style.display = "block";
      scrollToBottom();
    }
  }

  function hideTyping() {
    const el = document.getElementById("bb-ai-typing-container");
    if (el) el.style.display = "none";
  }

  function scrollToBottom() {
    const feed = document.getElementById("bb-ai-messages-feed");
    if (feed) {
      feed.scrollTop = feed.scrollHeight;
    }
  }

  function addUserMessage(text, scroll = true) {
    const feed = document.getElementById("bb-ai-messages-feed");
    if (!feed) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const msg = document.createElement("div");
    msg.className = "bb-ai-message bb-ai-message-user";
    msg.innerHTML = `
      <div class="bb-ai-bubble">
        <div>${escapeHtml(text)}</div>
        <div class="bb-ai-time">${time}</div>
      </div>
    `;
    feed.appendChild(msg);
    if (scroll) scrollToBottom();
  }

  function addBotMessage(htmlContent, inlineButtons = null) {
    const feed = document.getElementById("bb-ai-messages-feed");
    if (!feed) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const msg = document.createElement("div");
    msg.className = "bb-ai-message bb-ai-message-bot";

    let buttonsHtml = "";
    if (Array.isArray(inlineButtons) && inlineButtons.length > 0) {
      buttonsHtml = `
        <div class="bb-ai-inline-actions">
          ${inlineButtons
            .map(
              (b) => `
            <button class="bb-ai-btn-sm" data-ai-action="${b.action}" data-ai-param="${b.param || ""}">${b.label}</button>
          `
            )
            .join("")}
        </div>
      `;
    }

    msg.innerHTML = `
      <div class="bb-ai-avatar" style="width:28px; height:28px; font-size:12px; border-radius:8px; flex-shrink:0;">
        <i class="fas fa-robot"></i>
      </div>
      <div class="bb-ai-bubble">
        <div>${htmlContent}</div>
        ${buttonsHtml}
        <div class="bb-ai-time">${time}</div>
      </div>
    `;
    feed.appendChild(msg);
    scrollToBottom();
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Export public controller to window
  window.BackbenchersAI = {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
    loadStudent: (ht) => fetchStudentResult(ht, true),
    setStudent: (data) => setStudentContext(data),
    ask: (q) => {
      openChat();
      processUserQuery(q);
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBot);
  } else {
    initBot();
  }
})();
