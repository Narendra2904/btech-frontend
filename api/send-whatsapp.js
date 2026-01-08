import twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // 1. 👇 GET 'page' HERE
  const { name, roll, feedback, page } = req.body;

  if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN || !process.env.MY_NUMBER) {
    return res.status(500).json({ ok: false, error: "Server keys missing" });
  }

  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

  try {
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${process.env.MY_NUMBER}`,
      // 2. 👇 ADD IT TO THE MESSAGE HERE
      body: `📩 *New Feedback Received*\n\n📄 *Page:* ${page || "Unknown"}\n💬 *Message:* ${feedback}`
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Twilio Error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
