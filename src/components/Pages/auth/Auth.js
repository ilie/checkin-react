import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import Modal from "../../UI/Modal/Modal";
import LoginForm from "../../Login/LoginForm";
import AuthContext from "../../../store/auth-context";

const Auth = () => {
  const ctx = useContext(AuthContext);
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const isLoggedIn = ctx.isLoggedIn;

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
