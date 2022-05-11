import { Link } from "react-router-dom";
import classes from "./Login.module.css";

function Login() {
  const loginHandler = (e) => {
    e.preventDefault();
    console.log("Submitted");
  };
  return (
    <div className={classes.login}>
      <h1>Sign in to your account</h1>
      <form className={classes.loginform} onSubmit={loginHandler}>
        <div className={classes.formgroup}>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            name="email"
            id="email"
            placeholder="Email"
            autoComplete="off"
          />
        </div>
        <div className={classes.formgroup}>
          <label className={classes.pswlabel} htmlFor="password">
            Password
          </label>
          <Link className={classes.pswlink} to="forgot-password">
            {" "}
            Forgotten your password ?
          </Link>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
          />
        </div>
        <div className={classes.formgroup}>
          <button className={classes.loginBtn} type="submit">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
