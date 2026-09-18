const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/auth");
const {
  analyze,
  guestAnalyze,
  coverLetter,
  getHistory,
  getOne,
  deleteOne,
} = require("../controllers/resumeController");

// 📦 Multer config — store file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // ⚠️ 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("❌ Only PDF and DOCX files allowed"));
    }
  },
});

// 🛣️ Routes
router.post("/analyze", protect, upload.single("resume"), analyze);
router.post("/guest-analyze", upload.single("resume"), guestAnalyze);
router.post("/cover-letter", protect, coverLetter);
router.get("/history", protect, getHistory);
router.get("/:id", protect, getOne);
router.delete("/:id", protect, deleteOne);

module.exports = router;
