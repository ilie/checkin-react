import ForgotPasswordForm from "../../Forms/ForgotPasswordForm";
import "./Auth.css";
import Logo from "../../../assets/img/Checkin-blue.svg";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    return (
        <div className="auth_bg" id="auth_bg">
          <div className="auth__container">
            <span className="auth__logo">
              <img src={Logo} alt="Checkin App" />
            </span>
            <ForgotPasswordForm className="auth__form" />
            <Link to="/login" className="auth__container__link"> &laquo; Go back to login page</Link>
          </div>
        </div>
      )
}

export default ForgotPassword