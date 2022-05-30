import "./Auth.css";
import { Link } from "react-router-dom";
import Logo from "../../../assets/img/Checkin-blue.svg";
import ResetPasswordForm from "../../Forms/ResetPasswordForm";

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
