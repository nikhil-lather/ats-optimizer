import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedGuest = localStorage.getItem("guestMode");

      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      }

      if (savedGuest === "true") {
        setGuest(true);
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("guestMode");
    }

    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const userWithToken = { ...userData, token };

    setUser(userWithToken);
    setGuest(false);

    localStorage.setItem("user", JSON.stringify(userWithToken));
    localStorage.removeItem("guestMode");

    // Clear any previous guest session data
    sessionStorage.removeItem("guestAnalysis");
    sessionStorage.removeItem("guestResumeText");
    sessionStorage.removeItem("guestJobDescription");
  };

  const continueAsGuest = () => {
    setGuest(true);
    localStorage.setItem("guestMode", "true");
  };

  const logout = () => {
    setUser(null);
    setGuest(false);

    localStorage.removeItem("user");
    localStorage.removeItem("guestMode");

    // Clear guest session data
    sessionStorage.removeItem("guestAnalysis");
    sessionStorage.removeItem("guestResumeText");
    sessionStorage.removeItem("guestJobDescription");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        guest,
        login,
        continueAsGuest,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
