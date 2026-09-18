import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { analyzeResume, analyzeResumeAsGuest } from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

const GUEST_ANALYSIS_LIMIT = 4;

const Dashboard = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [guestAnalysesRemaining, setGuestAnalysesRemaining] = useState(() => {
    const saved = localStorage.getItem("guestAnalysesRemaining");

    return saved !== null ? Number(saved) : GUEST_ANALYSIS_LIMIT;
  });

  const { user, guest } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (selected) {
      setFile(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const dropped = e.dataTransfer.files[0];

    if (dropped) {
      setFile(dropped);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      return toast.error("Please upload your resume");
    }

    if (jobDescription.trim().length < 50) {
      return toast.error("Job description too short (min 50 chars)");
    }

    if (guest && guestAnalysesRemaining <= 0) {
      return toast.error(
        "🚫 Guest limit reached. Create an account to continue.",
      );
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const { data } = guest
        ? await analyzeResumeAsGuest(formData)
        : await analyzeResume(formData);

      toast.success("Analysis complete! 🎯");

      if (guest) {
        const remaining = data.analysesRemaining;

        setGuestAnalysesRemaining(remaining);

        localStorage.setItem("guestAnalysesRemaining", String(remaining));

        navigate("/results", {
          state: {
            analysis: data.analysis,
            resumeText: data.resumeText,
            jobDescription: data.jobDescription,
          },
        });
      } else {
        navigate(`/results/${data.resumeId}`);
      }
    } catch (error) {
      const errorData = error.response?.data;

      if (errorData?.guestLimitReached) {
        setGuestAnalysesRemaining(0);

        localStorage.setItem("guestAnalysesRemaining", "0");

        toast.error("🚫 Guest limit reached. Create an account to continue.");

        return;
      }

      toast.error(errorData?.error || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const creditsRemaining = 10 - (user?.creditsUsed || 0);

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Analyze Your Resume 🎯</h1>

          <p>Upload your resume and paste the job description to get started</p>
        </div>

        <div className="credits-bar">
          {guest ? (
            <>
              <p>
                👤 Guest Mode — {guestAnalysesRemaining}{" "}
                {guestAnalysesRemaining === 1 ? "analysis" : "analyses"}{" "}
                remaining
              </p>

              <span>
                Guest limit: {GUEST_ANALYSIS_LIMIT} analyses · Analysis won't be
                saved to your account
              </span>
            </>
          ) : (
            <>
              <p>⚡ {creditsRemaining} free analyses remaining</p>

              <span>10 total per account</span>
            </>
          )}
        </div>

        <div className="dashboard-card">
          <h2>📄 Upload Resume (PDF or DOCX)</h2>

          <div
            className={`upload-area ${file ? "active" : ""}`}
            onClick={() => fileInputRef.current.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="upload-icon">📁</div>

            <p>
              <span>Click to upload</span> or drag and drop
            </p>

            <p>PDF or DOCX up to 5MB</p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx"
            style={{ display: "none" }}
          />

          {file && <div className="file-selected">✅ {file.name}</div>}
        </div>

        <div className="dashboard-card">
          <h2>📋 Paste Job Description</h2>

          <textarea
            className="textarea-field"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <button
          className="btn-analyze"
          onClick={handleSubmit}
          disabled={loading || (guest && guestAnalysesRemaining <= 0)}
        >
          {loading
            ? "🔍 Analyzing..."
            : guest && guestAnalysesRemaining <= 0
              ? "🚫 Guest Limit Reached"
              : "🚀 Analyze My Resume"}
        </button>

        {guest && guestAnalysesRemaining <= 0 && (
          <button
            className="btn-analyze"
            onClick={() => navigate("/register")}
            style={{ marginTop: "12px" }}
          >
            ✨ Create Account to Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
