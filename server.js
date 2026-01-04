require("dotenv").config();
const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(express.json());
app.use(cors());

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

app.post("/api/send-whatsapp", async (req, res) => {
  const { name, email, roll, feedback } = req.body;

  const text = `📩 *New Website Feedback*\n👤 Name: ${name}\n📧 Email: ${email}\n🎓 Roll: ${roll}\n💬 ${feedback}`;

  try {
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${process.env.MY_NUMBER}`,
      body: text
    });
    res.json({ ok: true, ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

app.listen(3000, () => console.log("Server running on 3000"));
