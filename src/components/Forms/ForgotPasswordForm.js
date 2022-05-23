import "./Forms.css";
import { useRef, useState } from "react";
import useAxios from "../../hooks/useAxios";
import { ToastContainer, toast } from "react-toastify";

function ForgotPasswordForm() {
  const [error, setError] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoafing] = useState(false);
  const emailref = useRef();
  const { Axios } = useAxios();

  const onChangehandler = (e) =>{
    setInputValue(e.target.value);
  }

  const onSubmitHandler = (e) => {
    e.preventDefault();
    setIsLoafing(true);
    const enteredEmail = emailref.current.value;
    Axios.post("/forgot-password", { email: enteredEmail }).then((res) => {
      setIsLoafing(false);
      setInputValue('');
      toast.success(res.data.message,{autoClose: false});
    }).catch((e)=>{
      setIsLoafing(false);
      setInputValue('');
      toast.success('If your email exists in our database, you will receive a reset link.',{autoClose: false});
    });
  };
  return (
    <div className="form_container">
      <ToastContainer />
      <h1 className="form__h1">Reset your password</h1>
      <span className="form_container__info">
        Enter the email address associated with your account, and we'll send you
        a link to reset your password.
      </span>
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
            value={inputValue}
            onChange={onChangehandler}
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

export default ForgotPasswordForm;
