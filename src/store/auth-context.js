import React, { useState } from "react";
import axios from "axios";
const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  isAdmin: false,
  login: (token) => {},
  setAdmin: (isAdmin) => {},
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
  const loginHandler = (token) => {
    setToken(token);
    localStorage.setItem("token", token);
  };
  const userIsAdminHandler = (isAdmin) => {
    setIsAdmin(isAdmin);
    localStorage.setItem("isAdmin", isAdmin);
  };
  const logoutHandler = () => {
    const api = axios.create({
      baseURL: `https://api.checkin.virginialyons.com/api`,
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    api
      .post("/logout")
      .then((res) => {
       clearLogin();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const clearLoginDataHandler = () => {
    clearLogin()
  };

  const clearLogin = () => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
  }

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    isAdmin: userIsAdmin,
    login: loginHandler,
    setAdmin: userIsAdminHandler,
    logout: logoutHandler,
    clearLoginData: clearLoginDataHandler

  };
  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
