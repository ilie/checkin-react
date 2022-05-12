import classes from "./LoginForm.module.css";
import { Link } from "react-router-dom";

function LoginForm(props) {
  const errors = props.loginFailed ? (
    <span className={classes.error}>{props.loginError}</span>
  ) : (
    ""
  );
  return (
    <div className={classes.login}>
      <h1>Sign in to your account</h1>
      {errors}
      <form className={classes.loginform} onSubmit={props.onSubmit}>
        <div className={classes.formgroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            autoComplete="off"
            required
            ref={props.emailInputRef}
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
            required
            ref={props.passInputRef}
          />
        </div>
        <div className={classes.formgroup}>
          <button className={classes.loginBtn} type="submit">
            {props.isLoading ? "loading..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
