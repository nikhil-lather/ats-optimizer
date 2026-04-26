import { Link } from "react-router-dom";
import "../styles/Error.css";

const Error = () => {
  return (
    <div className="error-container">
      <h1 className="error-code">404</h1>
      <h2 className="error-title">Page Not Found</h2>
      <p className="error-message">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/">
        <button className="error-btn">Go Home</button>
      </Link>
    </div>
  );
};

export default Error;
