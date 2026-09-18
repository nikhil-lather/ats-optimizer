import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getOne,
  generateCoverLetter,
  generateGuestCoverLetter,
} from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/Results.css";

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const guestAnalysis = location.state?.analysis;

  const storedGuestAnalysis = sessionStorage.getItem("guestAnalysis");
  const storedGuestResumeText = sessionStorage.getItem("guestResumeText");
  const storedGuestJobDescription = sessionStorage.getItem(
    "guestJobDescription",
  );

  const finalGuestAnalysis =
    guestAnalysis ||
    (storedGuestAnalysis ? JSON.parse(storedGuestAnalysis) : null);

  const finalGuestResumeText =
    location.state?.resumeText || storedGuestResumeText || "";

  const finalGuestJobDescription =
    location.state?.jobDescription || storedGuestJobDescription || "";
  useEffect(() => {
    if (guestAnalysis) {
      sessionStorage.setItem("guestAnalysis", JSON.stringify(guestAnalysis));
      sessionStorage.setItem("guestResumeText", guestResumeText || "");
      sessionStorage.setItem("guestJobDescription", guestJobDescription || "");
    }
  }, [guestAnalysis, guestResumeText, guestJobDescription]);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      // 👤 Guest result
      if (!id && finalGuestAnalysis) {
        setResume(finalGuestAnalysis);
        setLoading(false);
        return;
      }

      // 🔐 Logged-in user result
      if (id) {
        try {
          const { data } = await getOne(id);
          setResume(data.resume);
        } catch {
          toast.error("Failed to load results");
          navigate("/dashboard");
        } finally {
          setLoading(false);
        }
        return;
      }

      toast.error("No results found");
      navigate("/dashboard");
      setLoading(false);
    };

    fetchResult();
  }, [id, finalGuestAnalysis, navigate]);

  const handleCoverLetter = async () => {
    setGenerating(true);
    setShowModal(true);

    try {
      let data;

      if (id) {
        // 🔐 Logged-in user
        const response = await generateCoverLetter({
          resumeId: id,
          jobDescription: resume.jobDescription,
        });

        data = response.data;
      } else {
        // 👤 Guest user
        const response = await generateGuestCoverLetter({
          resumeText: finalGuestResumeText,
          jobDescription: finalGuestJobDescription,
        });

        data = response.data;
      }

      setCoverLetter(data.coverLetter);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to generate cover letter",
      );
      setShowModal(false);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text("ATS Optimizer Report", 105, y, { align: "center" });
    y += 15;

    // Match Score
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Match Score: ${resume.matchScore}%`, 20, y);
    y += 10;

    // Overall Feedback
    if (resume.overallFeedback) {
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      const feedback = doc.splitTextToSize(resume.overallFeedback, 170);
      doc.text(feedback, 20, y);
      y += feedback.length * 7 + 5;
    }

    // Missing Keywords
    doc.setFontSize(13);
    doc.setTextColor(220, 38, 38);
    doc.text("Missing Keywords:", 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const missingText = resume.missingKeywords?.join(", ") || "None";
    const missingLines = doc.splitTextToSize(missingText, 170);
    doc.text(missingLines, 20, y);
    y += missingLines.length * 6 + 8;

    // Present Keywords
    doc.setFontSize(13);
    doc.setTextColor(22, 163, 74);
    doc.text("Present Keywords:", 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const presentText = resume.presentKeywords?.join(", ") || "None";
    const presentLines = doc.splitTextToSize(presentText, 170);
    doc.text(presentLines, 20, y);
    y += presentLines.length * 6 + 8;

    // Suggestions
    if (resume.suggestions?.length > 0) {
      doc.setFontSize(13);
      doc.setTextColor(37, 99, 235);
      doc.text("Improvement Suggestions:", 20, y);
      y += 8;
      resume.suggestions.forEach((s, i) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`${i + 1}. ${s.reason}`, 20, y);
        y += 6;
        doc.setTextColor(220, 38, 38);
        const origLines = doc.splitTextToSize(
          `Original: ${s.originalText}`,
          165,
        );
        doc.text(origLines, 25, y);
        y += origLines.length * 6;
        doc.setTextColor(22, 163, 74);
        const sugLines = doc.splitTextToSize(
          `Improved: ${s.suggestedText}`,
          165,
        );
        doc.text(sugLines, 25, y);
        y += sugLines.length * 6 + 5;
      });
    }

    // Formatting Issues
    if (resume.formattingIssues?.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(13);
      doc.setTextColor(217, 119, 6);
      doc.text("Formatting Issues:", 20, y);
      y += 8;
      resume.formattingIssues.forEach((issue) => {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`⚠️ ${issue}`, 25, y);
        y += 7;
      });
    }

    doc.save("ats-optimizer-report.pdf");
    toast.success("PDF downloaded! 📄");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Copied to clipboard! 📋");
  };

  if (loading) {
    return <div className="loading-container">Loading results... 🔍</div>;
  }

  return (
    <div className="results-container">
      <Navbar />
      <div className="results-content">
        <div className="results-header">
          <h1>Analysis Results 📊</h1>
          <p>Here's how your resume performed against the job description</p>
        </div>

        {/* Score Card */}
        <div className="score-card">
          <div className="score-number">{resume.matchScore}%</div>
          <div className="score-label">ATS Match Score</div>
          <div className="score-bar-container">
            <div
              className="score-bar"
              style={{ width: `${resume.matchScore}%` }}
            />
          </div>
        </div>

        {/* Overall Feedback */}
        {resume.overallFeedback && (
          <div className="overall-feedback">💡 {resume.overallFeedback}</div>
        )}

        {/* Keywords Grid */}
        <div className="results-grid">
          <div className="results-card">
            <h2>❌ Missing Keywords ({resume.missingKeywords?.length})</h2>
            <div className="keywords-list">
              {resume.missingKeywords?.map((kw, i) => (
                <span key={i} className="keyword-tag missing">
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div className="results-card">
            <h2>✅ Found Keywords ({resume.presentKeywords?.length})</h2>
            <div className="keywords-list">
              {resume.presentKeywords?.map((kw, i) => (
                <span key={i} className="keyword-tag present">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {resume.suggestions?.length > 0 && (
          <div className="suggestions-card">
            <h2>💡 Improvement Suggestions</h2>
            {resume.suggestions.map((s, i) => (
              <div key={i} className="suggestion-item">
                <p className="suggestion-reason">🎯 {s.reason}</p>
                <div className="suggestion-original">❌ {s.originalText}</div>
                <div className="suggestion-improved">✅ {s.suggestedText}</div>
              </div>
            ))}
          </div>
        )}

        {/* Formatting Issues */}
        {resume.formattingIssues?.length > 0 && (
          <div className="formatting-card">
            <h2>⚠️ Formatting Issues</h2>
            {resume.formattingIssues.map((issue, i) => (
              <div key={i} className="formatting-issue">
                ⚠️ {issue}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="results-actions">
          <button className="btn-cover-letter" onClick={handleCoverLetter}>
            ✍️ Generate Cover Letter
          </button>
          <button className="btn-export" onClick={handleExportPDF}>
            📄 Export PDF
          </button>
          <button
            className="btn-new-analysis"
            onClick={() => navigate("/dashboard")}
          >
            🔄 New Analysis
          </button>
        </div>
      </div>

      {/* Cover Letter Modal */}
      {showModal && (
        <div className="cover-letter-modal">
          <div className="cover-letter-content">
            <h2>✍️ Your Cover Letter</h2>
            {generating ? (
              <p>Generating your cover letter... ✨</p>
            ) : (
              <>
                <div className="cover-letter-text">{coverLetter}</div>
                <div className="cover-letter-actions">
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button className="btn-new-analysis" onClick={handleCopy}>
                    📋 Copy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
