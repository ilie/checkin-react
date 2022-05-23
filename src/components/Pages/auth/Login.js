import LoginForm from "../../Forms/LoginForm";
import useAuth from "../../../hooks/useAuth";
import "./Auth.css";
import Logo from "../../../assets/img/Checkin-blue.svg";
import { Link } from "react-router-dom";

const Login = () => {


  return (
    <div className="auth_bg" id="auth_bg">
      <div className="auth__container">
        <span className="auth__logo">
          <img src={Logo} alt="Checkin App" />
        </span>
        <LoginForm className="auth__form" />
        <Link to="/forgot-password" className="auth__container__link"> Forgot your password?</Link>
      </div>
    </div>
  );
};

export default Login;
