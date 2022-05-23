import "./App.css";
import { useContext } from "react";
import Login from "./components/Pages/auth/Login";
import ResetPassword from "./components/Pages/auth/ResetPassword";
import ForgotPassword from "./components/Pages/auth/ForgotPassword";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthContext from "./store/auth-context";
import Home from "./components/Pages/Home/Home";
import Header from "./components/Header/Header";
import Users from "./components/Pages/Users/Users";
import Checkins from "./components/Pages/Checkins/Checkins";

import useAuth from "./hooks/useAuth";

function App() {
  const authCtx = useContext(AuthContext);

  return (
    <div className="App">
      <Header />

      {authCtx.isLoggedIn ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checkins" element={<Checkins />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<Navigate to="/"></Navigate>} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login"></Navigate>} />
        </Routes>
      )}
    </div>
  );
}

export default App;
