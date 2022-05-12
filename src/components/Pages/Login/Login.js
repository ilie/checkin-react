import axios from "axios";
import LoginForm from "./LoginForm";
import { useRef, useState, useContext } from "react";
import AuthContext from "../../../store/auth-context";

function Login() {
  const authCtx = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [loginError, setLoginError] = useState("");
  const emailInputRef = useRef();
  const passInputRef = useRef();

  const api = axios.create({
    baseURL: `https://api.checkin.virginialyons.com/api`,
    headers: {
      "content-type": "application/json",
    },
  });

  const loginHandler = (event) => {
    event.preventDefault();
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passInputRef.current.value;

    //Make http request
    setIsLoading(true);
    api
      .post("/login", {
        email: enteredEmail,
        password: enteredPassword,
      })
      .then((res) => {
        setIsLoading(false);
        authCtx.login(res.data.attributes.token);
        authCtx.setAdmin(res.data.attributes.is_admin);
      })
      .catch((error) => {
        setIsLoading(false);
        setLoginFailed(true);
        setLoginError(error.response.data.error);
      });
  };

  return (
    <LoginForm
      onSubmit={loginHandler}
      loginFailed={loginFailed}
      loginError={loginError}
      isLoading={isLoading}
      emailInputRef={emailInputRef}
      passInputRef={passInputRef}
    />
  );
}

export default Login;
