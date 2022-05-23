import "./Forms.css";
import useAxios from "../../hooks/useAxios";
import { deserialize } from "jsonapi-fractal";
import AuthContext from "../../store/auth-context";
import { useRef, useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function LoginForm(props) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const emailInputRef = useRef();
  const passInputRef = useRef();
  const authCtx = useContext(AuthContext);
  const { Axios } = useAxios();

  const loginHandler = (e) => {
    e.preventDefault();
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passInputRef.current.value;

    setIsLoading(true);
    Axios.post("/login", {
      email: enteredEmail,
      password: enteredPassword,
    })
      .then((res) => {
        setIsLoading(false);
        const data = deserialize(res);
        authCtx.login(data.token);
        authCtx.setAdmin(data.is_admin);
        navigate('/', {replace:true});
      })
      .catch((error) => {
        const errorMsg = error.response.data.error;
        toast.error(errorMsg);
      });
  };

  return (
    <div className="form_container">
      <ToastContainer />
      <h1 className="form__h1">Sign in to your account</h1>
      <form className="form" onSubmit={loginHandler}>
        <div className="form__formgroup">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            autoComplete="off"
            required
            ref={emailInputRef}
          />
        </div>
        <div className="form__formgroup">
          <label className="form__pswlabel" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            required
            ref={passInputRef}
          />
        </div>
        <div className="form__formgroup">
          <button className="form__btn" type="submit">
            {props.isLoading ? "loading..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
