import twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { name, email, roll, feedback } = req.body;

  const TWILIO_SID = process.env.TWILIO_SID;
  const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
  const MY_NUMBER = process.env.MY_NUMBER;

  const client = twilio(TWILIO_SID, TWILIO_TOKEN);

  const text = `📩 New Feedback\n👤 Name: ${name}\n📧 Email: ${email}\n🎓 Roll: ${roll}\n💬 ${feedback}`;

  try {
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${MY_NUMBER}`,
      body: text
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
}
