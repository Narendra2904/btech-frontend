import twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { name, roll, feedback, page } = req.body || {};

  if (!feedback) {
    return res.status(400).json({ ok: false, error: "Feedback is required" });
  }

  if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN || !process.env.MY_NUMBER) {
    console.error("Twilio credentials missing on server");
    return res.status(500).json({ ok: false, error: "Twilio credentials not configured" });
  }

  try {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    let toNum = process.env.MY_NUMBER.trim();
    if (!toNum.startsWith("+")) {
      toNum = toNum.startsWith("91") && toNum.length === 12 ? `+${toNum}` : `+91${toNum}`;
    }

    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:${toNum}`,
      body: `📩 *New Feedback Received*\n\n📄 *Page:* ${page || "Unknown"}\n💬 *Message:* ${feedback}\n👤 *Roll:* ${roll || "N/A"}`
    });

    return res.status(200).json({ ok: true, method: "twilio" });
  } catch (err) {
    console.error("Twilio Error:", err.message);
    return res.status(500).json({ ok: false, error: err.message || "Failed to send via Twilio" });
  }
}

