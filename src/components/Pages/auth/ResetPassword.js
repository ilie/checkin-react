import ResetPasswordForm from "../../Forms/ResetPasswordForm";
import useAuth from "../../../hooks/useAuth";
import "./Auth.css";
import Logo from "../../../assets/img/Checkin-blue.svg";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  return (
    <div className="auth_bg" id="auth_bg">
      <div className="auth__container">
        <span className="auth__logo">
          <img src={Logo} alt="Checkin App" />
        </span>
        <ResetPasswordForm className="auth__form" />
        <Link  to="/login" className="auth__container__link">
          Go back to login page
        </Link>
      </div>
    </div>
  )
}

export default ResetPassword;
