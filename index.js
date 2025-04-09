const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const geminiApiKey = process.env.API_KEY;
const googleAI = new GoogleGenerativeAI(geminiApiKey);
const geminiModel = googleAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const generate = async (question) => {
  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: question }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
        stopSequences: [],
      },
    });
    const response = await result.response;
    const text = response.text();

    // Optional: Extract only code blocks
    const codeOnly = text.match(/```(?:[\s\S]*?)```/g);
    return codeOnly ? codeOnly.join("\n\n") : text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "❌ Sorry, something went wrong.";
  }
};


app.post("/api/content", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ result: "Question is required." });
  }

  const result = await generate(question);
  res.json({ result });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
