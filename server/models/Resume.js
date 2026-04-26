const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  originalResumeText: {
    type: String,
    required: true,
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  missingKeywords: [String],
  presentKeywords: [String],
  suggestions: [
    {
      section: String,
      originalText: String,
      suggestedText: String,
      reason: String,
    },
  ],
  formattingIssues: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resume", resumeSchema);
