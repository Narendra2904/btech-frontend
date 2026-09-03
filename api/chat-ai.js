/**
 * Serverless AI Proxy for Backbenchers AI Academic Assistant
 * Deployed on Vercel (/api/chat-ai)
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { message, student } = req.body || {};

  if (!message) {
    return res.status(400).json({ ok: false, error: "Message is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // If Gemini API key is configured, invoke Gemini 1.5 Flash
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

      const response = await fetch(
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

      const json = await response.json();
      const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (reply) {
        return res.status(200).json({ ok: true, reply });
      }
    } catch (err) {
      console.error("Gemini API Error:", err.message);
      // Fallback below
    }
  }

  // Fallback intelligent response if no API key is provided
  const query = message.toLowerCase();
  let fallbackReply = `
    <p>🎓 <strong>Backbenchers AI Academic Guidance:</strong></p>
    <p>For JNTUH B.Tech students, here are key rules to keep in mind:</p>
    <ul>
      <li><strong>Passing Marks:</strong> Minimum 26 marks out of 75 in external examination, and aggregate 40% (internal + external).</li>
      <li><strong>Promotion Criteria:</strong> Secure minimum 50% credits in 1st year to promote to 2nd year; 60% credits up to 2nd year to promote to 3rd year.</li>
      <li><strong>Supply Strategy:</strong> Focus on 3 complete units from previous 3-year question papers for high probability of passing.</li>
    </ul>
  `;

  return res.status(200).json({ ok: true, reply: fallbackReply });
}
