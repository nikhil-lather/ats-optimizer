import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getHistory, deleteResume } from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/History.css";

const History = () => {
  const { guest } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (guest) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const { data } = await getHistory();
        setResumes(data.resumes);
      } catch {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [guest]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteResume(id);
      setResumes(resumes.filter((r) => r._id !== id));
      toast.success("Deleted successfully!");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const getScoreClass = (score) => {
    if (score >= 70) return "high";
    if (score >= 40) return "medium";
    return "low";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="loading-container">Loading history... 📋</div>;
  }

  return (
    <div className="history-container">
      <Navbar />
      <div className="history-content">
        <div className="history-header">
          <h1>Analysis History 📋</h1>
          {guest ? (
            <p>
              You're using Guest Mode. Create an account to save your analyses.
            </p>
          ) : (
            <p>All your previous resume analyses</p>
          )}
        </div>

        {guest ? (
          <div className="history-empty">
            <h2>History is available for registered users 🔐</h2>
            <p>
              Your guest analyses aren't saved. Create an account to keep your
              analysis history.
            </p>
            <button
              className="btn-new-analysis"
              onClick={() => navigate("/register")}
            >
              ✨ Create Account
            </button>
          </div>
        ) : resumes.length === 0 ? (
          <div className="history-empty">
            <h2>No analyses yet!</h2>
            <p>Start by analyzing your resume against a job description</p>
            <button
              className="btn-new-analysis"
              onClick={() => navigate("/dashboard")}
            >
              🚀 Analyze Now
            </button>
          </div>
        ) : (
          <div className="history-grid">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="history-card"
                onClick={() => navigate(`/results/${resume._id}`)}
              >
                <div className="history-card-left">
                  <div
                    className={`score-circle ${getScoreClass(resume.matchScore)}`}
                  >
                    {resume.matchScore}%
                  </div>
                  <div className="history-card-info">
                    <h3>{resume.jobDescription}</h3>
                    <p>
                      {resume.missingKeywords?.length} missing keywords •{" "}
                      {formatDate(resume.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="history-card-right">
                  <button className="btn-view">View</button>
                  <button
                    className="btn-delete"
                    onClick={(e) => handleDelete(e, resume._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
