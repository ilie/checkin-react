import "./Forms.css";
import { useRef, useState } from "react";
import useAxios from "../../hooks/useAxios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function ResetPasswordForm() {
  const [error, setError] = useState(false);
  const [emailInputValue, setEmailInputValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordConfirmValue, setPasswordConfirmValue] = useState("");
   const [isLoading, setIsLoafing] = useState(false);
  const emailref = useRef();
  const passwordref = useRef();
  const passwordConfirmref = useRef();
  const { Axios } = useAxios();
  const currentUrl = window.location.href
  let  token = currentUrl.split("?")[1];
  const navigate = useNavigate();


  const redirectToLogin = (seconds = 0) => {
    setTimeout(()=>{
        navigate('/login')
    }, seconds * 1000);
  }

  const onChangeEmailHandler = (e) => {
    setEmailInputValue(e.target.value)
  };

  const onChangePassHandler = (e) => {
    setPasswordValue(e.target.value);
  };

  const onChangeConfirmPassHandler = (e) => {
    setPasswordConfirmValue(e.target.value);
  };


  const onSubmitHandler = (e) => {
    e.preventDefault();
    setIsLoafing(true);
    const enteredEmail = emailref.current.value;
    const enteredPassword = passwordref.current.value;
    const enteredConfirmPassword = passwordConfirmref.current.value;

    const requiredData = {
     token: token,
      email: enteredEmail,
      password: enteredPassword,
      password_confirmation: enteredConfirmPassword,
    };

    console.log(requiredData);

    Axios.post("/reset-password", requiredData)
      .then((res) => {
        setIsLoafing(false);
        const message = res.data.message;
        toast.success(message);
        setEmailInputValue('');
        setPasswordValue('');
        setPasswordConfirmValue('');
        redirectToLogin(5);
      })
      .catch((e) => {
        const errorMessage = e.response.data.errors[0].title;
        setIsLoafing(false);
        //setInputValue("");
         toast.error(errorMessage,{ autoClose: 10000 });
      });
  };
  return (
    <div className="form_container">
      <ToastContainer />
      <h1 className="form__h1">Reset your password</h1>
      <form className="form" onSubmit={onSubmitHandler}>
        <div className="form__formgroup">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            autoComplete="off"
            required
            ref={emailref}
            value={emailInputValue}
            onChange={onChangeEmailHandler}
          />
        </div>
        <div className="form__formgroup">
          <label htmlFor="email">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Your new password"
            autoComplete="off"
            required
            ref={passwordref}
            value={passwordValue}
            onChange={onChangePassHandler}
          />
        </div>
        <div className="form__formgroup">
          <label htmlFor="email">Password Confirm</label>
          <input
            type="password"
            name="password_confirmation"
            id="password_confirmation"
            placeholder="Confirm your new password"
            autoComplete="off"
            required
            ref={passwordConfirmref}
            value={passwordConfirmValue}
            onChange={onChangeConfirmPassHandler}
          />
        </div>
        <div className="form__formgroup">
          <button className="form__btn" type="submit">
            {isLoading ? "loading..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResetPasswordForm;
