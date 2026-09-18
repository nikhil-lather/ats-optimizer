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

        // Make sure existing guest sessions have a guest ID
        if (!localStorage.getItem("guestId")) {
          const guestId = crypto.randomUUID();
          localStorage.setItem("guestId", guestId);
        }
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("guestMode");
      localStorage.removeItem("guestId");
    }

    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const userWithToken = { ...userData, token };

    setUser(userWithToken);
    setGuest(false);

    localStorage.setItem("user", JSON.stringify(userWithToken));
    localStorage.removeItem("guestMode");

    // Clear previous guest session data
    sessionStorage.removeItem("guestAnalysis");
    sessionStorage.removeItem("guestResumeText");
    sessionStorage.removeItem("guestJobDescription");
  };

  const continueAsGuest = () => {
    setGuest(true);
    localStorage.setItem("guestMode", "true");

    // Create a unique guest ID if one doesn't already exist
    if (!localStorage.getItem("guestId")) {
      const guestId = crypto.randomUUID();
      localStorage.setItem("guestId", guestId);
    }
  };

  const logout = () => {
    setUser(null);
    setGuest(false);

    localStorage.removeItem("user");
    localStorage.removeItem("guestMode");
    localStorage.removeItem("guestId");

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
