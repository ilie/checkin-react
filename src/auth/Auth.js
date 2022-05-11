import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Modal from "../components/UI/Modal/Modal";
import LoginForm from "../components/Pages/Login/Login";

const Auth = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  //const token = localStorage.getItem("token");

  useEffect(() => {
    if (isLoggedIn) {
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  }, [location.pathname, isLoggedIn]);
  let content = <LoginForm />;

  if (location.pathname === "/forgot-password") {
    content = "<p>Forgot password</p>";
  }
  if (location.pathname === "/reset-password") {
    content = "<p>Reset password</p>";
  }

  return <Modal showModal={showModal}>{content}</Modal>;
};

export default Auth;
