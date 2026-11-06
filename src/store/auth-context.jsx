import { useState, useCallback, useMemo, createContext } from "react";
import axios from "axios";
import { API_URL } from "../helpers/api";
import { clear as clearClockQueue } from "../pwa/clockQueue";
import { forgetStatus } from "../pwa/clockStatus";
import { rememberTurnedOff, unsubscribePush } from "../pwa/push";

const AuthContext = createContext({
  token: "",
  isLoggedIn: false,
  isAdmin: false,
  user: null,
  login: () => {},
  setAdmin: () => {},
  setAdminFalse: () => {},
  logout: () => {},
  clearLoginData: () => {},
});

// The profile from the login response: { id, name, email, hoursOnContract }. Sessions from before it was saved have none.
function savedUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function AuthContextProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  // Kept as "1" or "0", since localStorage only holds strings. Reading it with !! made "0" an admin after a reload.
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("isAdmin") === "1");
  const [user, setUser] = useState(savedUser);
  const isLoggedIn = !!token;

  const clearLogin = useCallback(() => {
    setToken(null);
    setIsAdmin(false);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("user");
    // A shared phone: the next person must not inherit a queued tap, this person's status and badge, or their choice
    // to turn reminders off.
    clearClockQueue(localStorage);
    forgetStatus();
    rememberTurnedOff(false);
  }, []);

  const login = useCallback((token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }, []);

  const setAdmin = useCallback((isAdmin) => {
    setIsAdmin(Boolean(isAdmin));
    localStorage.setItem("isAdmin", isAdmin ? "1" : "0");
  }, []);

  const setAdminFalse = useCallback(() => {
    localStorage.removeItem("isAdmin");
    setIsAdmin(false);
  }, []);

  const logout = useCallback(() => {
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    // Reminders stop with the session. The API's copy goes while the token still works,
    // and a failure there mustn't keep anyone signed in.
    unsubscribePush(api)
      .catch(() => {})
      .then(() => api.post("/logout"))
      // Signed out on this phone even when the API can't be reached: the next person mustn't inherit the session.
      .catch(() => {})
      .finally(clearLogin);
  }, [token, clearLogin]);

  const contextValue = useMemo(
    () => ({
      token,
      isLoggedIn,
      isAdmin,
      user,
      login,
      setAdmin,
      setAdminFalse,
      logout,
      clearLoginData: clearLogin,
    }),
    [token, isLoggedIn, isAdmin, user, login, setAdmin, setAdminFalse, logout, clearLogin],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export default AuthContext;
