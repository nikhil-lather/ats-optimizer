const Resume = require("../models/Resume");
const User = require("../models/User");
const GuestUsage = require("../models/GuestUsage");
const { analyzeResume, generateCoverLetter } = require("../services/aiService");
const { extractTextFromFile } = require("../services/pdfService");

const GUEST_ANALYSIS_LIMIT = 4;

// 🔍 Analyze Resume
// @route POST /api/resume/analyze
const analyze = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!req.file) {
      return res.status(400).json({
        error: "📄 Please upload a resume file",
      });
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({
        error: "📝 Job description too short (min 50 chars)",
      });
    }

    // 🔒 Check credit limit (max 10 free analyses)
    const user = await User.findById(req.user.id);

    if (user.creditsUsed >= 10) {
      return res.status(403).json({
        error: "🚫 Free limit reached (10 analyses)",
      });
    }

    // 📄 Extract text from uploaded file
    const resumeText = await extractTextFromFile(req.file);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: "❌ Could not extract text from file",
      });
    }

    // 🤖 Send to AI for analysis
    const analysis = await analyzeResume(resumeText, jobDescription);

    // 💾 Save to database
    const resume = await Resume.create({
      userId: req.user.id,
      jobDescription,
      originalResumeText: resumeText.substring(0, 5000),
      matchScore: analysis.matchScore,
      missingKeywords: analysis.missingKeywords,
      presentKeywords: analysis.presentKeywords,
      suggestions: analysis.suggestions,
      formattingIssues: analysis.formattingIssues,
    });

    // 📈 Update user credits
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { creditsUsed: 1 },
    });

    res.status(201).json({
      success: true,
      resumeId: resume._id,
      analysis: {
        ...analysis,
        creditsUsed: user.creditsUsed + 1,
        creditsRemaining: 10 - (user.creditsUsed + 1),
      },
    });
  } catch (error) {
    console.error("❌ Analysis error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// ✍️ Generate Cover Letter
// @route POST /api/resume/cover-letter
const coverLetter = async (req, res) => {
  try {
    const { jobDescription, resumeId } = req.body;

    // 📂 Get resume from DB
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        error: "❌ Resume not found",
      });
    }

    // 🤖 Generate cover letter
    const letter = await generateCoverLetter(
      resume.originalResumeText,
      jobDescription,
    );

    res.json({
      success: true,
      coverLetter: letter,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// 👤 Guest Cover Letter
// @route POST /api/resume/guest-cover-letter
const guestCoverLetter = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: "📄 Resume text is missing or too short",
      });
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({
        error: "📝 Job description too short (min 50 chars)",
      });
    }

    const letter = await generateCoverLetter(resumeText, jobDescription);

    res.json({
      success: true,
      coverLetter: letter,
      guest: true,
    });
  } catch (error) {
    console.error("❌ Guest cover letter error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// 📋 Get Analysis History
// @route GET /api/resume/history
const getHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select(
        "matchScore createdAt missingKeywords presentKeywords jobDescription",
      );

    res.json({
      success: true,
      resumes,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// 🔎 Get Single Analysis
// @route GET /api/resume/:id
const getOne = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        error: "❌ Resume not found",
      });
    }

    res.json({
      success: true,
      resume,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// 🗑️ Delete Analysis
// @route DELETE /api/resume/:id
const deleteOne = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        error: "❌ Resume not found",
      });
    }

    res.json({
      success: true,
      message: "🗑️ Resume deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// 👤 Guest Resume Analysis
// @route POST /api/resume/guest-analyze
const guestAnalyze = async (req, res) => {
  try {
    const { jobDescription, guestId } = req.body;

    // 🔑 Guest ID is required
    if (!guestId) {
      return res.status(400).json({
        error: "❌ Guest session not found. Please refresh and try again.",
      });
    }

    // 🔢 Get or create guest usage record
    let guestUsage = await GuestUsage.findOne({ guestId });

    if (!guestUsage) {
      guestUsage = await GuestUsage.create({
        guestId,
        analysesUsed: 0,
      });
    }

    // 🚫 Check guest analysis limit
    if (guestUsage.analysesUsed >= GUEST_ANALYSIS_LIMIT) {
      return res.status(403).json({
        error:
          "🚫 Guest limit reached (4 analyses). Create an account to continue.",
        guestLimitReached: true,
        analysesUsed: guestUsage.analysesUsed,
        analysesRemaining: 0,
      });
    }

    // 📄 Validate resume
    if (!req.file) {
      return res.status(400).json({
        error: "📄 Please upload a resume file",
      });
    }

    // 📝 Validate job description
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({
        error: "📝 Job description too short (min 50 chars)",
      });
    }

    // 📄 Extract resume text
    const resumeText = await extractTextFromFile(req.file);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: "❌ Could not extract text from file",
      });
    }

    // 🤖 Send to AI
    const analysis = await analyzeResume(resumeText, jobDescription);

    // 📈 Increment guest usage ONLY after successful AI analysis
    guestUsage.analysesUsed += 1;
    await guestUsage.save();

    res.status(200).json({
      success: true,
      analysis,
      resumeText,
      jobDescription,
      guest: true,
      analysesUsed: guestUsage.analysesUsed,
      analysesRemaining: GUEST_ANALYSIS_LIMIT - guestUsage.analysesUsed,
    });
  } catch (error) {
    console.error("❌ Guest analysis error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  analyze,
  guestAnalyze,
  coverLetter,
  guestCoverLetter,
  getHistory,
  getOne,
  deleteOne,
};
