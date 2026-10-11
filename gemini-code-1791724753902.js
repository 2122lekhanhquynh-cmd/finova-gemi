require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = process.env.PORT || 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  try {
    const { message, financialContext } = req.body;

    const systemInstruction = `
      You are FINOVA AI, an intelligent personal finance assistant integrated into the FINOVA platform.
      Your responsibilities:
      1. Guide users in navigating and using FINOVA.
      2. Explain financial concepts in clear, accessible language.
      3. Interpret financial assessment results, monthly cash flow, DTI ratio, and scenarios.
      4. Compare financial scenarios (Conservative, Baseline, Optimistic, etc.) and explain trade-offs/risks.
      5. Help users understand savings and investment plans.
      Strict Rules: Never guarantee financial outcomes or investment yields. Rely on user data provided.
      Current User Financial Context: ${JSON.stringify(financialContext || {})}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Không thể kết nối với FINOVA AI lúc này. Vui lòng thử lại sau.' });
  }
});

app.listen(port, () => {
  console.log(`FINOVA server đang chạy trên cổng ${port}`);
});