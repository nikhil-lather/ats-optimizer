import { Link } from "react-router-dom";
import "../styles/Landing.css";

const Landing = () => {
  return (
    <div className="landing-container">
      <div className="landing-badge">🚀 AI Powered Resume Optimizer</div>

      <h1>
        Beat the <span>ATS</span> Filter
        <br /> Get More Interviews
      </h1>

      <p>
        Upload your resume, paste the job description, and our AI will tell you
        exactly what's missing — so you stop getting rejected by robots.
      </p>

      <div className="landing-buttons">
        <Link to="/register">
          <button className="btn-white">Get Started Free →</button>
        </Link>
        <Link to="/login">
          <button className="btn-outline">Login</button>
        </Link>
      </div>

      <div className="landing-features">
        <div className="feature-card">
          <div className="icon">🎯</div>
          <h3>Match Score</h3>
          <p>See exactly how well your resume matches the job</p>
        </div>
        <div className="feature-card">
          <div className="icon">🔍</div>
          <h3>Missing Keywords</h3>
          <p>Find keywords ATS is looking for in your resume</p>
        </div>
        <div className="feature-card">
          <div className="icon">✍️</div>
          <h3>Cover Letter</h3>
          <p>AI generated cover letter tailored to the job</p>
        </div>
        <div className="feature-card">
          <div className="icon">📄</div>
          <h3>Export PDF</h3>
          <p>Download your optimized resume instantly</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
