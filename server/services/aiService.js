const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const analyzeResume = async (resumeText, jobDescription) => {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "user",
        content: `
You are an expert ATS (Applicant Tracking System) analyzer.
Analyze this resume against the job description and return ONLY valid JSON. No extra text, no markdown.

Job Description:
${jobDescription}

Resume:
${resumeText}

Return this exact JSON structure:
{
  "matchScore": number (0-100),
  "missingKeywords": ["keyword1", "keyword2"],
  "presentKeywords": ["keyword1", "keyword2"],
  "suggestions": [
    {
      "section": "experience",
      "originalText": "text from resume",
      "suggestedText": "improved version",
      "reason": "why this change helps"
    }
  ],
  "formattingIssues": ["issue1", "issue2"],
  "overallFeedback": "2-3 sentence summary of the resume"
}

Be strict and accurate. Only return valid JSON, nothing else.`,
      },
    ],
    temperature: 0.3,
  });

  const text = response.choices[0].message.content;
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
};

const generateCoverLetter = async (resumeText, jobDescription) => {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "user",
        content: `
You are an expert career coach. Write a professional cover letter based on this resume and job description.

Job Description:
${jobDescription}

Resume:
${resumeText}

Instructions:
- Keep it under 300 words
- Professional but personable tone
- Highlight matching skills
- Return ONLY the cover letter text, no extra commentary`,
      },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

module.exports = { analyzeResume, generateCoverLetter };
