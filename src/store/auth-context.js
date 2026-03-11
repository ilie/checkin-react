import { useState, useCallback, useMemo, createContext } from "react";
import axios from "axios";
const AuthContext = createContext({
  token: "",
  isLoggedIn: false,
  isAdmin: false,
  login: (token) => {},
  setAdmin: (isAdmin) => {},
  setAdminFalse: () => {},
  logout: () => {},
  clearLoginData: () => {},
});

export const AuthContextProvider = (props) => {
  const initalToken = localStorage.getItem("token");
  const initIsAdmin = localStorage.getItem("isAdmin");
  const [token, setToken] = useState(initalToken);
  const [isAdmin, setIsAdmin] = useState(initIsAdmin);
  const userIsLoggedIn = !!token;
  const userIsAdmin = !!isAdmin;
  const clearLogin = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
  }, []);

  const loginHandler = useCallback((token) => {
    setToken(token);
    localStorage.setItem("token", token);
  }, []);

  const userIsAdminHandler = useCallback((isAdmin) => {
    setIsAdmin(isAdmin);
    localStorage.setItem("isAdmin", isAdmin);
  }, []);

  const logoutHandler = useCallback(() => {
    const api = axios.create({
      baseURL: `https://api.checkin.virginialyons.com/api`,
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    api
      .post("/logout")
      .then(() => {
       clearLogin();
      })
      .catch((error) => {
        console.log(error);
      });
  }, [token, clearLogin]);

  const clearLoginDataHandler = useCallback(() => {
    clearLogin();
  }, [clearLogin]);

  const adminFalseHandler = useCallback(() => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
  }, []);

  const contextValue = useMemo(() => ({
    token: token,
    isLoggedIn: userIsLoggedIn,
    isAdmin: userIsAdmin,
    login: loginHandler,
    setAdmin: userIsAdminHandler,
    setAdminFalse: adminFalseHandler,
    logout: logoutHandler,
    clearLoginData: clearLoginDataHandler,
  }), [token, userIsLoggedIn, userIsAdmin, loginHandler, userIsAdminHandler, adminFalseHandler, logoutHandler, clearLoginDataHandler]);
  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
