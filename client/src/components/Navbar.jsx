import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "../styles/Navbar.css";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, guest, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-logo">
        ATS <span>Optimizer</span>
      </Link>

      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/history">History</Link>
      </div>

      <div className="navbar-right">
        {guest ? (
          <>
            <span className="navbar-user">👤 Guest Mode</span>
            <span className="navbar-credits">Login to save your analyses</span>
            <button
              className="btn-create-account"
              onClick={() => navigate("/register")}
            >
              Create Account
            </button>
          </>
        ) : (
          <>
            <span className="navbar-user">Hi, {user?.name} 👋</span>
            <span className="navbar-credits">
              {10 - (user?.creditsUsed || 0)} credits left
            </span>
          </>
        )}
        <ThemeToggle />
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
