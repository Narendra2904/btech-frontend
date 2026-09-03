import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import twilio from "twilio";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("./", { extensions: ["html"] })); // serves index.html and routes without .html extension

// Initialize Twilio client once
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// WhatsApp Feedback Route
app.post("/api/send-whatsapp", async (req, res) => {
  const { name, roll, feedback, page} = req.body;

  console.log("📨 Server received:", req.body);

  try {
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${process.env.MY_NUMBER}`,
      body: `📩 *New Feedback Received*\n💬 *Message:* ${feedback} \n📄 *Page:* ${page || "Unknown"}`
    });

    console.log("✅ Sent to Twilio WhatsApp sandbox!");
    res.json({ ok: true });
  } catch (err) {
    console.error("Twilio Error:", err.message);
    res.status(500).json({ ok: false });
  }
});


// AI Chatbot Route
app.post("/api/chat-ai", async (req, res) => {
  const { message, student } = req.body || {};

  if (!message) {
    return res.status(400).json({ ok: false, error: "Message is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const studentContext = student
        ? `STUDENT CONTEXT:
Name: ${student.name || "Student"}
Hall Ticket: ${student.hallTicket || "N/A"}
Branch: ${student.branch || "B.Tech"}
Semester Data: ${JSON.stringify(student.semesters || [])}`
        : `No student record currently loaded. Answer general JNTUH academic question.`;

      const prompt = `You are "Backbenchers AI", an intelligent, encouraging, expert academic advisor and result analysis assistant for JNTUH B.Tech students in Telangana and Andhra Pradesh.
Your mission is to help students understand their exam results, active backlogs/supplies, in which subjects they need to improve, promotion/credit detention rules (R18 & R22 regulations), grace marks (0.15% rule), campus placement eligibility (TCS, Infosys, Tier-1), and supply preparation blueprints.

${studentContext}

USER QUESTION:
"${message}"

INSTRUCTIONS:
1. Provide a direct, empathetic, and actionable response. If the user asks in Telugu/Tanglish (e.g. "naku enni supplies unnai", "ela pass avali"), reply in a warm, encouraging bilingual mix ("Bro, no tension...").
2. Use clean markdown formatting (bullet points, bold highlights).
3. If giving advice on supplies or improvements, mention practical exam tips (internal marks importance, 3-unit strategy, question paper patterns, step marking).
4. For Grace Marks: Explain the 0.15% limit (~8-9 marks across theory subjects). Note that R18 has 6-credit subject exemption, while R22 does not.
5. Keep the tone motivational, authentic, and student-friendly.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800
            }
          })
        }
      );

      const json = await geminiRes.json();
      const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (reply) {
        return res.json({ ok: true, reply });
      }
    } catch (err) {
      console.error("Gemini API Error:", err.message);
    }
  }

  // Fallback response if no key is provided
  res.json({
    ok: true,
    reply: `
      <p>🎓 <strong>Backbenchers AI Academic Guidance:</strong></p>
      <p>For JNTUH B.Tech examinations:</p>
      <ul>
        <li><strong>Passing Marks:</strong> Minimum 26/75 external and 40% aggregate.</li>
        <li><strong>Promotion:</strong> Need 50% credits in 1st year to enter 2nd year, and 60% credits to enter 3rd & 4th years.</li>
        <li><strong>Supply Preparation:</strong> Master 3 full units thoroughly from previous 3-year question papers.</li>
      </ul>
    `
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
