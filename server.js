import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import twilio from "twilio";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("./")); // serves index.html

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


// Start server
app.listen(3000, () => console.log("🚀 Server running at localhost:3000"));
