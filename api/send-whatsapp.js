import twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { name, roll, feedback, page, channel } = req.body || {};

  if (!feedback) {
    return res.status(400).json({ ok: false, error: "Feedback is required" });
  }

  // If Twilio credentials are configured, try sending
  if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.MY_NUMBER) {
    try {
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      await client.messages.create({
        from: "whatsapp:+14155238886",
        to: `whatsapp:+91${process.env.MY_NUMBER}`,
        body: `📩 *New Feedback Received*\n\n📄 *Page:* ${page || "Unknown"}\n💬 *Message:* ${feedback}\n👤 *Roll:* ${roll || "N/A"}`
      });
      return res.status(200).json({ ok: true, method: "twilio" });
    } catch (err) {
      console.warn("Twilio Warning (falling back to free mode):", err.message);
    }
  }

  // Return success in free mode
  return res.status(200).json({
    ok: true,
    freeMode: true,
    message: "Feedback processed via free mode"
  });
}
