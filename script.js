const SOCIAL_DATA = {
  instagram: {
    title: "INSTAGRAM",
    color: "bg-pink-500",
    icon: '<i class="fab fa-instagram text-white text-2xl"></i>',
    users: [
      { name: "Narendra Yenagandula", url: "https://instagram.com/narendra_yenagandula" },
      { name: "Madhan Myana", url: "https://instagram.com/madhan.myana" }
    ]
  },
  github: {
    title: "GITHUB",
    color: "bg-black",
    icon: '<i class="fab fa-github text-white text-2xl"></i>',
    users: [
      { name: "Narendra Yenagandula", url: "https://github.com/Narendra2904" },
      { name: "Madhan Myana", url: "https://github.com/madhanmyana" }
    ]
  },
  linkedin: {
    title: "LINKEDIN",
    color: "bg-blue-600",
    icon: '<i class="fab fa-linkedin-in text-white text-2xl"></i>',
    users: [
      { name: "Narendra Yenagandula", url: "https://www.linkedin.com/in/narendra-yenagandula/" },
      { name: "Madhan Myana", url: "https://www.linkedin.com/in/madhan-myana-7ab90a335/" }
    ]
  }
};

function openPopup(type) {
  const popup = document.getElementById("socialPopup");
  const title = document.getElementById("popupTitle");
  const iconBox = document.getElementById("popupIcon");
  const usersBox = document.getElementById("popupUsers");

  const data = SOCIAL_DATA[type];
  if (!data) return;

  title.innerText = data.title;
  iconBox.className = `w-14 h-14 flex items-center justify-center mb-4 ${data.color}`;
  iconBox.innerHTML = data.icon;

  usersBox.innerHTML = "";
  data.users.forEach(u => {
    const a = document.createElement("a");
    a.href = u.url;
    a.target = "_blank";
    a.className =
      "flex justify-between items-center border border-black px-4 py-3 font-bold hover:bg-black hover:text-white transition";
    a.innerHTML = `<span>${u.name}</span><span>→</span>`;
    usersBox.appendChild(a);
  });

  popup.classList.remove("hidden");
}

function closePopup() {
  document.getElementById("socialPopup").classList.add("hidden");
}

// click outside popup to close
document.getElementById("socialPopup")
  .addEventListener("click", e => {
    if (e.target.id === "socialPopup") closePopup();
  });

/* ================= IMPROVED MOBILE MENU LOGIC ================= */

function toggleMobileMenu() {
    const menu = document.getElementById("mobileMenu");
    const icon = document.querySelector('nav button i'); // Targets the hamburger icon
    
    if (menu.classList.contains("hidden")) {
        // Open Menu
        menu.classList.remove("hidden");
        menu.classList.add("animate-reveal"); // Adds your slide-up animation
        if (icon) icon.className = "fas fa-times"; // Change to 'X' icon
    } else {
        // Close Menu
        menu.classList.add("hidden");
        if (icon) icon.className = "fas fa-bars"; // Change back to Hamburger
    }
}

// Close mobile menu automatically when a link is clicked
document.querySelectorAll('#mobileMenu a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById("mobileMenu").classList.add("hidden");
        const icon = document.querySelector('nav button i');
        if (icon) icon.className = "fas fa-bars";
    });
});
function calculateCGPA(semesters) {
    let totalCredits = 0;
    let totalPoints = 0;

    semesters.forEach(sem => {
        sem.subjects.forEach(sub => {
            const gp = GRADE_POINTS[sub.grade] ?? 0;
            const credits = parseFloat(sub.credits || 0);
            totalCredits += credits;
            totalPoints += gp * credits;
        });
    });

    return totalCredits === 0 ? "0.00" : (totalPoints / totalCredits).toFixed(2);
}



/* ---------- Spotlight ---------- */
document.addEventListener("mousemove", e => {
    const s = document.getElementById("spotlight");
    s.style.setProperty("--x", e.clientX + "px");
    s.style.setProperty("--y", e.clientY + "px");
});

/* ---------- Greeting ---------- */
window.onload = () => {
    const g = document.getElementById("timeGreeting");
    const h = new Date().getHours();
    g.innerText =
        h < 12 ? "— Good Morning  Bro—" :
        h < 17 ? "— Good Afternoon Bro—" :
                 "— Good Evening Bro—";
    g.classList.remove("opacity-0");
};

/* ---------- Helpers ---------- */
function countUp(id, end) {
    const el = document.getElementById(id);
    const start = performance.now();
    const dur = 1200;

    function tick(t) {
        const p = Math.min((t - start) / dur, 1);
        el.innerText = (p * end).toFixed(2);
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function createBurst() {
    const box = document.getElementById("burst-container");
    const icons = ["🔥","✨","🎓","⚡","✅"];
    for (let i = 0; i < 15; i++) {
        const d = document.createElement("div");
        d.className = "particle";
        d.innerText = icons[Math.floor(Math.random()*icons.length)];
        d.style.left = "50%";
        d.style.top = "50%";
        d.style.setProperty("--tx",(Math.random()*400-200)+"px");
        d.style.setProperty("--ty",(Math.random()*400-200)+"px");
        box.appendChild(d);
        setTimeout(()=>d.remove(),1000);
    }
}

/* ---------- Render Result ---------- */
function displayResult(data) {
    document.getElementById("resName").innerText = data.name;
document.getElementById("resRoll").innerText = data.hallTicket;

    countUp("resCgpa", data.cgpa || 0);
    countUp("resSgpa", data.sgpa || 0);

    const tbody = document.getElementById("resultTableBody");
    tbody.innerHTML = "";

    data.subjects.forEach((s, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="px-6 py-4 text-[10px] text-zinc-500">${s.code}</td>
            <td class="px-6 py-4 font-bold">${s.name}</td>
            <td class="px-6 py-4 text-center">${s.internal}</td>
            <td class="px-6 py-4 text-center">${s.external}</td>
            <td class="px-6 py-4 text-center">${s.internal + s.external}</td>
            <td class="px-6 py-4 text-center">
                <span class="grade-badge">${s.grade}</span>
            </td>
            <td class="px-6 py-4 text-center">${s.credits}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("resultContainer").classList.remove("hidden");
}

/* ================= GLOBAL STATE ================= */

let FULL_RESULT = null;
let CURRENT_VIEW = "all";

const GRADE_POINTS = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "B": 6,
  "C": 5,
  "D": 4,
  "F": 0,
  "S": 0
};

/* ================= MARK SUPPLY ================= */
function markSupplySubjects(semesters) {
  if (!Array.isArray(semesters)) return;

  const subjectAttemptCount = new Map();

  // Iterate through all semesters to calculate attempt numbers
  semesters.forEach(sem => {
    if (!Array.isArray(sem.subjects)) return;

    sem.subjects.forEach(sub => {
      const key = `${sub.subjectCode || sub.code}`; 
      
      // Increment the counter for this specific subject code
      const currentCount = (subjectAttemptCount.get(key) || 0) + 1;
      subjectAttemptCount.set(key, currentCount);
      
      // Save the attempt number into the subject object
      sub.attemptNumber = currentCount;
      
      // Define if it is a regular or supply attempt
      sub.attempt = currentCount === 1 ? "regular" : "supply";
    });
  });
}



/* ================= SEARCH ================= */
async function searchResult() {
    const htno = document.getElementById("hallTicketInput").value.trim().toUpperCase();
    const errorMsg = document.getElementById("errorMsg");
    const errorText = document.getElementById("errorText");
    const loading = document.getElementById("loadingState");
    const resultBox = document.getElementById("resultContainer");

    errorMsg.classList.add("hidden");
    resultBox.classList.add("hidden");

    if (!htno) {
        errorText.innerText = "Enter Hall Ticket Number";
        errorMsg.classList.remove("hidden");
        return;
    }

    loading.classList.remove("hidden");

    try {
        const API_BASE = "https://jntuh-backend-7rad.onrender.com";
        const res = await fetch(`${API_BASE}/result/${htno}`);
        const json = await res.json();

        if (!json || !json.data) throw new Error("No results");

        /* ================= NORMALIZE DATA ================= */
        let rawData = json.data;
        if (typeof rawData === 'string') {
            try {
                FULL_RESULT = JSON.parse(rawData.replace(/'/g, '"'));
            } catch (e) {
                console.error("JSON Parse Error:", e);
                throw new Error("Data format is invalid");
            }
        } else {
            FULL_RESULT = rawData;
        }

        /* ================= UPDATE UI HEADER ================= */
        document.getElementById("resName").innerText = FULL_RESULT.name || "—";
        document.getElementById("resRoll").innerText = FULL_RESULT.hallTicket || "—";
        document.getElementById("resFather").innerText = FULL_RESULT.fatherName || "—";
        document.getElementById("resBranch").innerText = FULL_RESULT.branch || "—";
        document.getElementById("resCollege").innerText = FULL_RESULT.college || "—";
        document.getElementById("resCollegeCode").innerText = FULL_RESULT.collegeCode || "—";

        markSupplySubjects(FULL_RESULT.semesters);

        /* ================= DROPDOWN ================= */
        const semSelect = document.getElementById("semesterSelect");
        semSelect.innerHTML = "";

        const allOpt = document.createElement("option");
        allOpt.value = "all";
        allOpt.textContent = "ALL SEMESTERS";
        semSelect.appendChild(allOpt);

        // Get unique names like ["1-1", "1-2", "2-1"]
        const uniqueSemNames = [...new Set(FULL_RESULT.semesters.map(s => s.semester))];

        /* Inside searchResult() Dropdown Setup */
uniqueSemNames.forEach((semName) => {
    const opt = document.createElement("option");
    opt.value = semName;
    // Label clearly so user knows this is the first attempt view
    opt.textContent = `SEMESTER ${semName}`;
    semSelect.appendChild(opt);
});

        semSelect.onchange = (e) => renderResult(e.target.value);

        renderResult("all");
        loading.classList.add("hidden");
        resultBox.classList.remove("hidden");
        createBurst();

    } catch (err) {
        console.error("searchResult error:", err);
        errorText.innerText = err.message;
        errorMsg.classList.remove("hidden");
        loading.classList.add("hidden");
    }
} 

/* ================= MOVE THESE OUTSIDE ================= */

function calculateSGPA(subjects) {
    let credits = 0;
    let points = 0;
    subjects.forEach(sub => {
        const gp = GRADE_POINTS[sub.grade] ?? 0;
        const cr = parseFloat(sub.credits || 0);
        credits += cr;
        points += gp * cr;
    });
    return credits === 0 ? "0.00" : (points / credits).toFixed(2);
}

function calculateCGPA(semesters) {
    let credits = 0;
    let points = 0;
    semesters.forEach(sem => {
        if (!Array.isArray(sem.subjects)) return;
        sem.subjects.forEach(sub => {
            const gp = GRADE_POINTS[sub.grade] ?? 0;
            const cr = parseFloat(sub.credits || 0);
            credits += cr;
            points += gp * cr;
        });
    });
    return credits === 0 ? "0.00" : (points / credits).toFixed(2);
}

/* ================= CONSOLIDATED RENDER LOGIC ================= */
function renderResult(mode) {
    if (!FULL_RESULT || !Array.isArray(FULL_RESULT.semesters)) return;
    const tbody = document.getElementById("resultTableBody");
    tbody.innerHTML = "";

    if (mode === "all") {
        FULL_RESULT.semesters.forEach(sem => renderSemester(sem));
        addOverallCGPA();
    } else {
        const semEntries = FULL_RESULT.semesters.filter(s => s.semester === mode);
        if (semEntries.length > 0) {
            const firstAttemptSem = { semester: mode, subjects: [] };
            const seen = new Set();
            semEntries.forEach(entry => {
                entry.subjects.forEach(sub => {
                    const code = sub.subjectCode || sub.code;
                    if (!seen.has(code)) {
                        seen.add(code);
                        firstAttemptSem.subjects.push(sub);
                    }
                });
            });
            renderSemester(firstAttemptSem);
        }
    }
}

function renderSemester(sem) {
    addSemesterHeader(sem.semester);
    const subjects = sem.subjects || [];
    
    // 1. Map to count occurrences of each subject in THIS semester
    const subjectCounts = {};
    subjects.forEach(sub => {
        const code = sub.subjectCode || sub.code;
        subjectCounts[code] = (subjectCounts[code] || 0) + 1;
    });

    // 2. Track which codes we have already printed to identify the "repeat" row
    const printedInThisSem = new Set();

    const regularSubjects = subjects.filter(s => s.attempt === "regular");
    const supplySubjects = subjects.filter(s => s.attempt === "supply" || s.attempt === "rcrv");

    // Render Regular
    if (regularSubjects.length > 0) {
        addSubHeader("REGULAR RESULTS", regularSubjects[0].examCode || "");
        regularSubjects.forEach(sub => {
            const code = sub.subjectCode || sub.code;
            // It is RC/RV ONLY if count > 1 AND we already printed one
            const isRCRV = subjectCounts[code] > 1 && printedInThisSem.has(code);
            addRow(sub, isRCRV);
            printedInThisSem.add(code);
        });
    }
    
    // Render Supply
    if (supplySubjects.length > 0) {
        const lastSupply = supplySubjects[supplySubjects.length - 1];
        addSubHeader("SUPPLY RESULTS", lastSupply.examCode || "", lastSupply.attemptNumber || "");
        
        supplySubjects.forEach(sub => {
            const code = sub.subjectCode || sub.code;
            // It is RC/RV ONLY if count > 1 AND we already printed one
            const isRCRV = subjectCounts[code] > 1 && printedInThisSem.has(code);
            addRow(sub, isRCRV);
            printedInThisSem.add(code);
        });
    }
    addSGPARow(calculateSGPA(subjects));
}

/* ================= TABLE HELPERS ================= */
function addSemesterHeader(semName) {
  const tbody = document.getElementById("resultTableBody");
  const tr = document.createElement("tr");
  tr.innerHTML = `<td colspan="7" class="bg-zinc-900 text-yellow-400 font-extrabold px-6 py-2 text-center border border-zinc-800">${semName} Results</td>`;
  tbody.appendChild(tr);
}

function addSubHeader(title, examCode = "", attemptNum = "") {
  const tbody = document.getElementById("resultTableBody");
  const tr = document.createElement("tr");
  
  // Badge styling for attempt and exam code
  const attemptHtml = attemptNum ? `<span class="ml-2 bg-zinc-800 text-[8px] md:text-[9px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 font-mono">ATTEMPT: ${attemptNum}</span>` : "";
  const codeHtml = examCode ? `<span class="ml-2 md:ml-3 text-[8px] md:text-[9px] text-zinc-500 font-mono">[CODE: ${examCode}]</span>` : "";
  
  let officialLink = "";
  if (examCode && FULL_RESULT && FULL_RESULT.hallTicket) {
      // Official JNTUH result URL construction
      const baseUrl = "http://results.jntuh.ac.in/results/resultAction";
      const params = `?degree=btech&examCode=${examCode}&etype=r17&result=null&grad=null&type=intgrade&htno=${FULL_RESULT.hallTicket}`;
      
      // "no-print" class ensures this disappears in the PDF print
      officialLink = `
        <a href="${baseUrl}${params}" target="_blank" 
           class="no-print ml-auto text-[8px] md:text-[9px] bg-yellow-accent/10 hover:bg-yellow-accent/20 text-yellow-accent border border-yellow-accent/30 px-2 py-1 rounded transition-all flex items-center gap-1">
           <i class="fas fa-external-link-alt text-[7px]"></i> OFFICIAL RESULT
        </a>`;
  }
  
  tr.innerHTML = `
    <td colspan="7" class="bg-black text-orange-400 font-bold px-4 py-2 uppercase tracking-widest text-[9px] md:text-[11px]">
      <div class="flex items-center justify-between md:justify-start">
        <span class="truncate">${title}${attemptHtml}${codeHtml}</span>
        ${officialLink}
      </div>
    </td>`;
  tbody.appendChild(tr);
}

function addRow(sub, isRCRV = false) {
    const tbody = document.getElementById("resultTableBody");
    const tr = document.createElement("tr");
    
    const isFailed = ["F", "S", "ABSENT", "Ab"].includes(sub.grade);
    
    // Highlighting Logic
    let rowBg = "transparent";
    if (isFailed) {
        rowBg = "rgba(239, 68, 68, 0.12)"; // Red for Fail
    } else if (isRCRV) {
        rowBg = "rgba(59, 130, 246, 0.08)"; // Blue for RC/RV
    }

    // Badge logic: Only shows if the repeat logic above triggered it
    const rcrvBadge = isRCRV 
        ? `<span class="ml-2 bg-blue-500/20 text-blue-400 text-[8px] px-1.5 py-0.5 rounded border border-blue-500/30 font-black">RC/RV</span>` 
        : "";

    const gradeClass = isFailed ? "text-red-500 font-black" : "text-zinc-200";

    tr.style.backgroundColor = rowBg;
    tr.innerHTML = `
        <td class="px-2 md:px-6 py-3 border border-zinc-800 font-mono text-zinc-500 text-[9px] md:text-[12px]">${sub.subjectCode}</td>
        <td class="px-2 md:px-6 py-3 border border-zinc-800 font-medium text-[9px] md:text-[12px]">
            <div class="flex items-center">
                <span class="${isFailed ? 'text-red-300' : ''}">${sub.subjectName}</span>
                ${rcrvBadge}
            </div>
        </td>
        <td class="px-1 md:px-4 py-3 border border-zinc-800 text-center text-[9px] md:text-[12px]">${sub.internal || '0'}</td>
        <td class="px-1 md:px-4 py-3 border border-zinc-800 text-center text-[9px] md:text-[12px]">${sub.external || '0'}</td>
        <td class="px-1 md:px-4 py-3 border border-zinc-800 text-center text-[9px] md:text-[12px]">${sub.total || '0'}</td>
        <td class="px-1 md:px-4 py-3 border border-zinc-800 text-center text-[9px] md:text-[12px] ${gradeClass}">${sub.grade}</td>
        <td class="px-1 md:px-4 py-3 border border-zinc-800 text-center text-[9px] md:text-[12px]">${sub.credits}</td>`;
    
    tbody.appendChild(tr);
}

            
function addSGPARow(sgpa) {
  const tbody = document.getElementById("resultTableBody");
  const tr = document.createElement("tr");
  tr.innerHTML = `<td colspan="7" class="text-right bg-black font-bold text-green-400 px-6 py-3 border border-zinc-800">SGPA : ${sgpa}</td>`;
  tbody.appendChild(tr);
}

function addOverallCGPA() {
  const tbody = document.getElementById("resultTableBody");
  const tr = document.createElement("tr");
  tr.innerHTML = `<td colspan="7" class="text-right bg-zinc-950 font-extrabold text-yellow-400 px-6 py-4 border border-zinc-800">OVERALL CGPA : ${calculateCGPA(FULL_RESULT.semesters)}</td>`;
  tbody.appendChild(tr);
}

function handlePrint() {
    const originalTitle = document.title;
    const rollNo = document.getElementById("resRoll").innerText.trim();
    if (rollNo && rollNo !== "---") {
        document.title = rollNo;
    }
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 100);
}


/* ================= ENTER KEY ================= */

document.getElementById("hallTicketInput")
  ?.addEventListener("keydown", e => {
    if (e.key === "Enter") searchResult();
  });

(function(){
  emailjs.init("5kLoGgKCRJnViVqjs"); // 👈 replace
})();


/* ---------- FEEDBACK LOGIC (WEB3FORMS) ---------- */
async function sendFeedback() {
    const msgInput = document.getElementById("feedbackMessage");
    const btn = document.getElementById("feedbackBtn");
    const status = document.getElementById("feedbackStatus");
    const rollNo = document.getElementById("resRoll").innerText; // Capture user context

    const msg = msgInput.value.trim();
    if (!msg) return;

    // UI Loading State
    btn.innerText = "SENDING...";
    btn.disabled = true;
    btn.classList.add("opacity-60", "cursor-not-allowed");

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                access_key: "a97eb536-0fc7-4209-96ff-cc48e11fe234", // 👈 PASTE YOUR KEY HERE
                subject: `New Feedback from ${rollNo}`,
                from_name: "Backbenchers Results Portal",
                message: msg,
                hall_ticket: rollNo
            }),
        });

        const result = await response.json();

        if (result.success) {
            // SUCCESS UI
            status.classList.remove("hidden");
            status.innerText = "✅ Feedback Sent";
            msgInput.value = "";
            btn.innerText = "SENT ✓";
        } else {
            throw new Error("Failed to send");
        }
    } catch (err) {
        console.error(err);
        btn.innerText = "FAILED";
        status.classList.remove("hidden");
        status.innerText = "❌ Error Sending";
        status.classList.replace("text-green-500", "text-red-500");
    } finally {
        // Reset button after 3 seconds
        setTimeout(() => {
            btn.innerText = "SEND";
            btn.disabled = false;
            btn.classList.remove("opacity-60", "cursor-not-allowed");
            status.classList.add("hidden");
            // Reset colors for next attempt
            status.classList.replace("text-red-500", "text-green-500");
        }, 3000);
    }
}



function handlePrint() {
    // Save the original title
    const originalTitle = document.title;
    
    // Set the title to the Roll Number (e.g., 22S41A6695.pdf)
    const rollNo = document.getElementById("resRoll").innerText.trim();
    if (rollNo && rollNo !== "---") {
        document.title = rollNo;
    }
    
    // Open print dialog
    window.print();
    
    // Restore the original title after printing starts
    setTimeout(() => {
        document.title = originalTitle;
    }, 100);
}

  // Global function to close the notification
  window.closeAppNotification = function() {
    const banner = document.getElementById('app-download-notification');
    if (banner) {
      banner.style.display = 'none';
      // Save user preference so it doesn't show again
      localStorage.setItem('app_result_banner_v1', 'hidden');
    }
  };

  // Global function to show the notification
  window.initAppNotification = function() {
    const banner = document.getElementById('app-download-notification');
    const status = localStorage.getItem('app_result_banner_v1');

    // Show only if user hasn't hidden it before
    if (banner && status !== 'hidden') {
      banner.style.display = 'block';
      console.log("App notification initialized");
    }
  };

  // Run the notification after 3 seconds so user can see their results first
  window.addEventListener('load', () => {
    setTimeout(window.initAppNotification, 3000);
  });
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        // If it's an internal link (Home or Backlog)
        if (this.getAttribute('href').endsWith('.html')) {
            const loader = document.getElementById('loadingProgress');
            if (loader) {
                loader.style.width = '100%'; // Trigger the yellow bar at the top
            }
        }
    });
});


// Function to focus the search box when clicking the "Results" card
function scrollToSearch() {
    const searchSection = document.getElementById("searchAnchor");
    searchSection.scrollIntoView({ behavior: 'smooth' });
    document.getElementById("hallTicketInput").focus();
}

// Placeholder for Credit Checker logic
function openCreditChecker() {
    if (!FULL_RESULT) {
        alert("Please search for a Hall Ticket first to calculate credits.");
        scrollToSearch();
        return;
    }
    
    let earnedCredits = 0;
    FULL_RESULT.semesters.forEach(sem => {
        sem.subjects.forEach(sub => {
            // Only add credits if grade is not F, S, or Absent
            if (!["F", "S", "ABSENT", "Ab"].includes(sub.grade)) {
                earnedCredits += parseFloat(sub.credits || 0);
            }
        });
    });
    
    alert(`Total Credits Earned: ${earnedCredits}`);
}

// Placeholder for Comparison Tool
function openComparison() {
    alert("Comparison tool: Enter a second Hall Ticket in the next update!");
}

function renderCreditChecker() {
    if (!FULL_RESULT) return;

    // Update Header Info
    document.getElementById("studentName").innerText = FULL_RESULT.name || "---";
    document.getElementById("rollNumber").innerText = FULL_RESULT.hallTicket || "---";
    document.getElementById("collegeCode").innerText = FULL_RESULT.collegeCode || "---";
    document.getElementById("fatherName").innerText = FULL_RESULT.fatherName || "---";
    document.getElementById("collegeName").innerText = FULL_RESULT.college || "---";
    document.getElementById("branchName").innerText = FULL_RESULT.branch || "---";

    const container = document.getElementById("creditResults");
    container.innerHTML = ""; // Clear placeholders

    // Logic to group semesters into Years (1-1 & 1-2 = 1 Year, etc.)
    const years = { "1 Year": ["1-1", "1-2"], "2 Year": ["2-1", "2-2"], "3 Year": ["3-1", "3-2"], "4 Year": ["4-1", "4-2"] };

    Object.entries(years).forEach(([yearName, sems]) => {
        let yearHtml = `<div class="mb-6 border border-zinc-700">
            <div class="bg-zinc-900 text-blue-400 py-2 text-center font-black border-b border-zinc-700">${yearName}</div>
            <table class="w-full text-center text-[11px] tracking-widest">
                <tr class="bg-zinc-900/50 text-zinc-500 font-bold">
                    <td class="border border-zinc-700 p-2">SEMESTER</td>
                    <td class="border border-zinc-700 p-2">CREDITS</td>
                </tr>`;

        let totalYearCredits = 0;
        let earnedYearCredits = 0;

        sems.forEach(semName => {
            const semData = FULL_RESULT.semesters.find(s => s.semester === semName);
            if (semData) {
                let semCredits = 0;
                semData.subjects.forEach(sub => {
                    const cr = parseFloat(sub.credits || 0);
                    totalYearCredits += cr;
                    if (!["F", "S", "Ab", "ABSENT"].includes(sub.grade)) {
                        semCredits += cr;
                        earnedYearCredits += cr;
                    }
                });
                yearHtml += `<tr class="text-white">
                    <td class="border border-zinc-700 p-2">${semName}</td>
                    <td class="border border-zinc-700 p-2 font-bold">${semCredits}</td>
                </tr>`;
            }
        });

        yearHtml += `<tr class="bg-zinc-900 text-white font-black">
                <td class="border border-zinc-700 p-2">Credits Received</td>
                <td class="border border-zinc-700 p-2 text-yellow-accent">${earnedYearCredits}/${totalYearCredits}</td>
            </tr></table></div>`;
        
        if (totalYearCredits > 0) container.innerHTML += yearHtml;
    });
}


//credits
/* ================= CREDIT CHECKER CORE LOGIC ================= */

/* ================= CREDIT CHECKER CORE LOGIC ================= */

async function searchCredits() {
    const htno = document.getElementById("creditHTInput").value.trim().toUpperCase();
    const container = document.getElementById("creditTableContainer");
    const errorMsg = document.getElementById("creditError");
    const loading = document.getElementById("creditLoading"); // Point to the new loader
    const statusText = document.getElementById("loadingStatusText");

    if (!htno) {
        errorMsg.innerText = "Please enter a Hall Ticket Number";
        errorMsg.classList.remove("hidden");
        return;
    }

    // Reset UI and show Loading
    errorMsg.classList.add("hidden");
    container.classList.add("hidden");
    loading.classList.remove("hidden");
    
    // Step 1: Status Update
    statusText.innerText = "Connecting to Server...";

    try {
        // Step 2: Status Update
        setTimeout(() => { statusText.innerText = "Decrypting Records..."; }, 800);

        const res = await fetch(`https://jntuh-backend-7rad.onrender.com/result/${htno}`);
        const json = await res.json();
        
        if (!json || !json.data) throw new Error("Data not found");

        // Step 3: Status Update
        statusText.innerText = "Calculating Credits...";

        const data = typeof json.data === 'string' ? JSON.parse(json.data.replace(/'/g, '"')) : json.data;

        // Populate Headers
        document.getElementById("c_Name").innerText = data.name;
        document.getElementById("c_Roll").innerText = data.hallTicket;
        document.getElementById("c_CollCode").innerText = data.collegeCode;
        document.getElementById("c_Father").innerText = data.fatherName;
        document.getElementById("c_CollName").innerText = data.college;
        document.getElementById("c_Branch").innerText = data.branch;

        renderYearBlocks(data.semesters);

        // Success State
        loading.classList.add("hidden");
        container.classList.remove("hidden");
        
        if (typeof createBurst === "function") createBurst();

    } catch (err) {
        loading.classList.add("hidden");
        errorMsg.innerText = err.message;
        errorMsg.classList.remove("hidden");
    }
}
function renderYearBlocks(semesters) {
    const container = document.getElementById("yearBlocks");
    container.innerHTML = "";
    let gEarned = 0, gPossible = 0;

    // Latest Pass Logic: Track unique subjects passed across all attempts
    const passedMap = new Map();
    semesters.forEach(sem => {
        sem.subjects.forEach(sub => {
            const code = sub.subjectCode || sub.code;
            if (!["F", "S", "ABSENT", "Ab"].includes(sub.grade)) {
                passedMap.set(code, parseFloat(sub.credits || 0));
            }
        });
    });

    const years = { "1 Year": ["1-1", "1-2"], "2 Year": ["2-1", "2-2"], "3 Year": ["3-1", "3-2"], "4 Year": ["4-1", "4-2"] };

    Object.entries(years).forEach(([year, sems], idx) => {
        let yEarned = 0, yPossible = 0, rows = "";

        sems.forEach(sName => {
            const semData = semesters.find(s => s.semester === sName);
            if (semData) {
                let sEarned = 0;
                const sPossible = 20; // Fixed 20 credits per sem

                const uniqueCodes = [...new Set(semData.subjects.map(s => s.subjectCode || s.code))];
                uniqueCodes.forEach(code => {
                    if (passedMap.has(code)) sEarned += passedMap.get(code);
                });

                const earned = Math.min(sEarned, sPossible);
                yEarned += earned;
                yPossible += sPossible;

                rows += `<tr class="text-white border-b border-zinc-800 font-bold">
                    <td class="border border-zinc-800 p-3">${sName}</td>
                    <td class="border border-zinc-800 p-3">${earned} / ${sPossible}</td>
                </tr>`;
            }
        });

        if (yPossible > 0) {
            gEarned += yEarned; gPossible += yPossible;
            const div = document.createElement("div");
            div.className = "border-2 border-zinc-800 mb-6 opacity-0 animate-fade-in";
            div.style.animationDelay = `${idx * 0.15}s`;
            div.innerHTML = `
                <div class="bg-zinc-900 text-blue-400 py-2.5 text-center font-black uppercase border-b-2 border-zinc-800">${year}</div>
                <table class="w-full text-center text-[11px] tracking-widest">
                    <tr class="bg-zinc-900/60 text-blue-300 font-black"><td class="border border-zinc-800 p-2">SEMESTER</td><td class="border border-zinc-800 p-2">EARNED / TOTAL</td></tr>
                    ${rows}
                    <tr class="bg-zinc-900 text-white font-black"><td class="border border-zinc-800 p-3">Credits Received</td><td class="border border-zinc-800 p-3 text-yellow-accent">${yEarned}/${yPossible}</td></tr>
                </table>`;
            container.appendChild(div);
        }
    });

    // Update Grand Totals
    document.getElementById("grandTotalEarned").innerText = gEarned;
    document.getElementById("grandTotalPossible").innerText = gPossible;
    document.getElementById("grandTotalContainer").classList.remove("hidden");
}

/* ================= CREDIT CHECKER LOGIC ================= */

/**
 * Fetches result data from the backend and renders the credit summary table.
 * Specifically handles the grouping of semesters into academic years.
 */
async function fetchCredits() {
    const ht = document.getElementById("htInput").value.trim().toUpperCase();
    const resArea = document.getElementById("resultArea");
    const error = document.getElementById("errorMsg");
    
    // Validate input
    if (!ht) {
        error.innerText = "Please enter a Hall Ticket Number";
        error.classList.remove("hidden");
        return;
    }
    
    try {
        // Fetch data from the JNTUH Backend
        const response = await fetch(`https://jntuh-backend-7rad.onrender.com/result/${ht}`);
        const json = await response.json();
        
        if (!json || !json.data) throw new Error("Data not found for this Roll Number");
        
        // Normalize the data format
        const data = typeof json.data === 'string' ? JSON.parse(json.data.replace(/'/g, '"')) : json.data;

        // 1. Fill Student Information Header
        document.getElementById("resName").innerText = data.name || "---";
        document.getElementById("resRoll").innerText = data.hallTicket || "---";
        document.getElementById("resColCode").innerText = data.collegeCode || "---";
        document.getElementById("resFather").innerText = data.fatherName || "---";
        document.getElementById("resColName").innerText = data.college || "---";
        document.getElementById("resBranch").innerText = data.branch || "---";

        // 2. Process and Render Yearly Credit Blocks
        renderYearBlocks(data.semesters);
        
        // Show the results and hide errors
        resArea.classList.remove("hidden");
        error.classList.add("hidden");
        
    } catch (err) {
        console.error("fetchCredits error:", err);
        error.innerText = err.message;
        error.classList.remove("hidden");
        resArea.classList.add("hidden");
    }
}


/**
 * Handles professional printing of the credit report.
 * Renames document title to Roll Number for PDF naming.
 */
/**
 * Professional Print Handler for Credit Checker
 * Automatically sets the filename to the student's Hall Ticket number
 */
function handleCreditPrint() {
    const originalTitle = document.title;
    const rollNo = document.getElementById("c_Roll")?.innerText.trim();

    // Set document title to HTNO for clean PDF naming (e.g., 23S45A6608.pdf)
    if (rollNo && rollNo !== "---") {
        document.title = `Credit_Report_${rollNo}`;
    }

    // Trigger the print dialog
    window.print();

    // Restore original title after the dialog closes
    setTimeout(() => {
        document.title = originalTitle;
    }, 100);
}


/* ================= ENTER KEY LISTENER ================= */
// Target the Credit Checker input field
document.getElementById("creditHTInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchCredits(); // Calls your credit fetch function
    }
});




/* ================= COMPARISON LOGIC ================= */

async function compareResults() {
    const ht1 = document.getElementById("ht1").value.trim().toUpperCase();
    const ht2 = document.getElementById("ht2").value.trim().toUpperCase();
    const area = document.getElementById("compareArea");
    const loader = document.getElementById("compareLoading");
    const statusText = document.getElementById("compareStatusText");
    
    if (!ht1 || !ht2) return alert("Please enter both Hall Ticket numbers");

    area.classList.add("hidden");
    loader.classList.remove("hidden");
    statusText.innerText = "Connecting to JNTUH Server...";
    
    try {
        const [res1, res2] = await Promise.all([
            fetch(`https://jntuh-backend-7rad.onrender.com/result/${ht1}`).then(r => r.json()),
            fetch(`https://jntuh-backend-7rad.onrender.com/result/${ht2}`).then(r => r.json())
        ]);

        if (!res1.data || !res2.data) throw new Error("Roll Number(s) not found");

        const d1 = typeof res1.data === 'string' ? JSON.parse(res1.data.replace(/'/g, '"')) : res1.data;
        const d2 = typeof res2.data === 'string' ? JSON.parse(res2.data.replace(/'/g, '"')) : res2.data;

        renderCompareColumn("column1", d1);
        renderCompareColumn("column2", d2);

        loader.classList.add("hidden");
        area.classList.remove("hidden");
        if (typeof createBurst === "function") createBurst();

    } catch (err) {
        loader.classList.add("hidden");
        alert(err.message);
    }
}

function renderCompareColumn(columnId, data) {
    const col = document.getElementById(columnId);
    
    // Calculate Overall Stats
    const cgpa = calculateCGPA(data.semesters);
    const totalCredits = data.semesters.reduce((acc, sem) => 
        acc + sem.subjects.reduce((a, s) => !["F","S","Ab"].includes(s.grade) ? a + parseFloat(s.credits || 0) : a, 0), 0);

    // 1. Student Info Card
    col.innerHTML = `
        <div class="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden group hover:border-yellow-accent/50 transition-all">
            <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-accent/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <h2 class="text-yellow-accent font-black uppercase text-sm tracking-widest mb-1">${data.name}</h2>
            <p class="text-zinc-500 text-[10px] font-bold tracking-tighter mb-4">${data.hallTicket}</p>
            
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
                <div>
                    <p class="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">Final CGPA</p>
                    <p class="text-2xl font-black text-white">${cgpa}</p>
                </div>
                <div>
                    <p class="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">Total Credits</p>
                    <p class="text-2xl font-black text-blue-400">${totalCredits}</p>
                </div>
            </div>
        </div>
        <div id="${columnId}_sems" class="space-y-4 mt-6"></div>
    `;

    const semBox = document.getElementById(`${columnId}_sems`);
    const semNames = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];

    // 2. Individual Semester Summary Cards
    semNames.forEach(sName => {
        const semData = data.semesters.find(s => s.semester === sName);
        if (semData) {
            const sgpa = calculateSGPA(semData.subjects);
            const credits = semData.subjects.reduce((a, s) => !["F","S","Ab"].includes(s.grade) ? a + parseFloat(s.credits || 0) : a, 0);
            
            semBox.innerHTML += `
                <div class="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:bg-zinc-800/40 transition-all">
                    <div>
                        <p class="text-zinc-600 font-black text-[9px] uppercase tracking-widest mb-1">Semester ${sName}</p>
                        <div class="flex items-center gap-3">
                            <span class="text-white font-black text-sm">${sgpa} <span class="text-zinc-700 text-[10px]">SGPA</span></span>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-yellow-accent font-black text-sm">${credits} <span class="text-zinc-700 text-[10px]">CR</span></p>
                    </div>
                </div>
            `;
        }
    });
}

function handleComparePrint() {
    const originalTitle = document.title;
    const h1 = document.getElementById("ht1").value.trim().toUpperCase();
    const h2 = document.getElementById("ht2").value.trim().toUpperCase();
    
    if (h1 && h2) document.title = `Comparison_${h1}_vs_${h2}`;
    
    window.print();
    
    setTimeout(() => { document.title = originalTitle; }, 100);
}

/* ================= ENTER KEY FOR COMPARE ================= */
// Add listener to both input fields for Student 1 and Student 2
["ht1", "ht2"].forEach(id => {
    document.getElementById(id)?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            compareResults(); // Calls your comparison fetch function
        }
    });
});



//=========Backlog Checker Logic=========
/* ================= ENTER KEY LISTENER ================= */
document.getElementById("hallTicketInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        fetchBacklogReport(); // Triggers the search
    }
});

      window.onload = () => {
    const g = document.getElementById("timeGreeting");
    const h = new Date().getHours();
    g.innerText =
        h < 12 ? "— Good Morning  Bro—" :
        h < 17 ? "— Good Afternoon Bro—" :
                 "— Good Evening Bro—";
    g.classList.remove("opacity-0");
};

       


async function sendFeedback() {
    const msgInput = document.getElementById("feedbackMessage");
    const btn = document.getElementById("feedbackBtn");
    const status = document.getElementById("feedbackStatus");
    
    // Check if we have a Hall Ticket (some pages might not have it)
    const rollNoElement = document.getElementById("resRoll");
    const rollNo = rollNoElement ? rollNoElement.innerText : "Unknown/General";
    const currentPage = window.location.pathname;

    const msg = msgInput.value.trim();
    if (!msg) {
        alert("Please enter a message.");
        return;
    }

    // UI Loading State
    btn.innerText = "SENDING...";
    btn.disabled = true;

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                access_key: "a97eb536-0fc7-4209-96ff-cc48e11fe234",
                subject: `Feedback from ${rollNo}`,
                from_name: "Backbenchers Portal",
                message: msg,
                hall_ticket: rollNo,
                page_source: currentPage // This tells you which page they were on
            }),
        });

        const result = await response.json();

        if (result.success) {
            status.classList.remove("hidden");
            status.innerText = "✅ Feedback Sent";
            status.style.color = "#22c55e"; // Green
            msgInput.value = "";
            btn.innerText = "SENT ✓";
        } else {
            throw new Error("Failed");
        }
    } catch (err) {
        status.classList.remove("hidden");
        status.innerText = "❌ Error Sending";
        status.style.color = "#ef4444"; // Red
        btn.innerText = "FAILED";
    } finally {
        setTimeout(() => {
            btn.innerText = "SEND";
            btn.disabled = false;
            status.classList.add("hidden");
        }, 3000);
    }
}

        // Interactive UI
        document.addEventListener("mousemove", e => {
            const s = document.getElementById("spotlight");
            s.style.setProperty("--x", e.clientX + "px");
            s.style.setProperty("--y", e.clientY + "px");
        });

        function toggleMobileMenu() { document.getElementById("mobileMenu").classList.toggle("hidden"); }

        async function fetchBacklogReport() {
            const ht = document.getElementById("hallTicketInput").value.trim().toUpperCase();
            const loader = document.getElementById("loadingState");
            const area = document.getElementById("reportArea");
            const error = document.getElementById("errorMsg");

            if (!ht) return;
            error.classList.add("hidden"); area.classList.add("hidden"); loader.classList.remove("hidden");

            try {
                const res = await fetch(`https://jntuh-backend-7rad.onrender.com/result/${ht}`);
                const json = await res.json();
                if (!json.data) throw new Error("Roll Number not found.");

                const data = typeof json.data === 'string' ? JSON.parse(json.data.replace(/'/g, '"')) : json.data;

                // Student Info Mapping
                document.getElementById("resName").innerText = data.name || "---";
                document.getElementById("resFather").innerText = data.fatherName || "---";
                document.getElementById("resBranch").innerText = data.branch || "---";
                document.getElementById("resRoll").innerText = data.hallTicket || "---";
                document.getElementById("resColCode").innerText = data.collegeCode || "---";
                document.getElementById("resColName").innerText = data.college || "---";

                // 🟢 Logic strictly from activeBacklogs.ts
                const subjectMap = {};
                data.semesters.forEach(sem => {
                    sem.subjects.forEach(sub => {
                        const code = sub.subjectCode;
                        if (!subjectMap[code]) { subjectMap[code] = []; }
                        subjectMap[code].push({ ...sub, semesterLabel: `SEM ${sem.semester}` });
                    });
                });

                const backlogResult = {};
                let total = 0;

                Object.values(subjectMap).forEach(attempts => {
                    // Logic: If passed at least once (grade !== "F") → NOT a backlog
                    const hasPassed = attempts.some(sub => sub.grade && sub.grade !== "F");

                    if (!hasPassed) {
                        const lastAttempt = attempts[attempts.length - 1]; // Latest for display
                        if (!backlogResult[lastAttempt.semesterLabel]) { 
                            backlogResult[lastAttempt.semesterLabel] = []; 
                        }
                        backlogResult[lastAttempt.semesterLabel].push(lastAttempt);
                        total++;
                    }
                });

                document.getElementById("countBadge").innerText = `⚠️ ${total} Pending Subjects Found`;
                renderSemesterTables(backlogResult);
                
                loader.classList.add("hidden"); 
                area.classList.remove("hidden");
            } catch (err) {
                loader.classList.add("hidden"); 
                error.innerText = err.message; 
                error.classList.remove("hidden");
            }
        }

        function renderSemesterTables(grouped) {
            const container = document.getElementById("semesterTablesContainer");
            container.innerHTML = "";
            const sortedSems = Object.keys(grouped).sort();

            if (sortedSems.length === 0) {
                container.innerHTML = `<p class="text-center py-10 text-green-500 font-black uppercase tracking-widest">🎉 No Active Backlogs Detected</p>`;
                return;
            }

            sortedSems.forEach(sem => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <h3 class="text-yellow-accent font-black text-xs mb-3 uppercase tracking-widest border-l-4 border-yellow-accent pl-2 sem-header">${sem}</h3>
                    <div class="overflow-x-auto rounded-xl border border-zinc-800 sem-table">
                        <table class="w-full text-left">
                            <thead class="bg-zinc-900/50 text-zinc-400 text-[9px] uppercase">
                                <tr>
                                    <th class="px-4 py-3 border border-zinc-800">Code</th>
                                    <th class="px-4 py-3 border border-zinc-800">Subject Name</th>
                                    <th class="px-3 py-3 border border-zinc-800 text-center">Int</th>
                                    <th class="px-3 py-3 border border-zinc-800 text-center">Ext</th>
                                    <th class="px-3 py-3 border border-zinc-800 text-center">Tot</th>
                                    <th class="px-3 py-3 border border-zinc-800 text-center">Gr</th>
                                </tr>
                            </thead>
                            <tbody class="text-[11px]">
                                ${grouped[sem].map(s => `
                                    <tr class="border-b border-zinc-800/50">
                                        <td class="px-4 py-3 border-r border-zinc-800 font-mono text-zinc-500">${s.subjectCode}</td>
                                        <td class="px-4 py-3 border-r border-zinc-800 font-bold uppercase">${s.subjectName}</td>
                                        <td class="px-3 py-3 border-r border-zinc-800 text-center">${s.internal || 0}</td>
                                        <td class="px-3 py-3 border-r border-zinc-800 text-center">${s.external || 0}</td>
                                        <td class="px-3 py-3 border-r border-zinc-800 text-center font-black">${(Number(s.internal)||0) + (Number(s.external)||0)}</td>
                                        <td class="px-3 py-3 text-center text-red-500 font-black">${s.grade}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>`;
                container.appendChild(div);
            });
        }

        function handlePrint() {
            const originalTitle = document.title;
            const rollNo = document.getElementById("resRoll").innerText.trim();
            if (rollNo && rollNo !== "---") { document.title = rollNo; }
            window.print();
            setTimeout(() => { document.title = originalTitle; }, 100);
        }
        document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        // If it's an internal link (Home or Backlog)
        if (this.getAttribute('href').endsWith('.html')) {
            const loader = document.getElementById('loadingProgress');
            if (loader) {
                loader.style.width = '100%'; // Trigger the yellow bar at the top
            }
        }
    });
});


