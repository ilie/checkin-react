import "./Forms.css";
import axios from "axios";
import { useFormik } from "formik";
import { useContext } from "react";
import useAxios from "../../hooks/useAxios";
import { deserialize } from "jsonapi-fractal";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../store/auth-context";
import { ToastContainer, toast } from "react-toastify";
import { loginSchema } from "../../schemas/yupValidations";

function LoginForm(props) {
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);
  const { Axios } = useAxios();

  const getCSRF = async () => {
    await axios.get('https://api.checkin.virginialyons.com/sanctum/csrf-cookie');
  }

  const loginHandler = (values) => {
    getCSRF();
    Axios.post("/login", {
      email: values.email,
      password: values.password,
    })
      .then((res) => {
        const data = deserialize(res);
        authCtx.login(data.token);
        authCtx.setAdmin(data.is_admin);
        navigate("/", { replace: true });
      })
      .catch((error) => {
        const errorMsg = error.response.data.error;
        toast.error(errorMsg);
      });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: loginHandler,
  });

  return (
    <div className="auth_form__container">
      <ToastContainer />
      <h1 className="auth_form__h1">Sign in to your account</h1>
      <form className="auth_form" onSubmit={formik.handleSubmit}>
        <div className="auth_form__formgroup">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            autoComplete="off"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.errors.email && formik.touched.email ? "input-error" : ""
            }
          />
          {formik.errors.email && formik.touched.email ? (
            <small className="red">{formik.errors.email}</small>
          ) : null}
        </div>
        <div className="auth_form__formgroup">
          <label className="auth_form__pswlabel" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.errors.password && formik.touched.password
                ? "input-error"
                : ""
            }
          />
          {formik.errors.password && formik.touched.password ? (
            <small className="red">{formik.errors.password}</small>
          ) : null}
        </div>
        <div className="auth_form__formgroup">
          <button
            className="form__btn"
            type="submit"
            disabled={
              !formik.isValid ||
              (Object.keys(formik.touched).length === 0 &&
                formik.touched.constructor === Object)
            }
          >
            {props.isLoading ? "loading..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
