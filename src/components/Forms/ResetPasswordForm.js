import "./Forms.css";
import { useFormik } from "formik";
import useAxios from "../../hooks/useAxios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { resetPassword } from "../../schemas/yupValidations";

function ResetPasswordForm() {
  const { Axios } = useAxios();
  const currentUrl = window.location.href;
  let token = currentUrl.split("?")[1];
  const navigate = useNavigate();

  const redirectToLogin = (seconds = 0) => {
    setTimeout(() => {
      navigate("/login");
    }, seconds * 1000);
  };

  const onSubmitHandler = (values, actions) => {
    const requiredData = {
      token: token,
      email: values.email,
      password: values.password,
      password_confirmation: values.password_confirmation,
    };

    Axios.post("/reset-password", requiredData)
      .then((res) => {
        const message = res.data.message;
        toast.success(message);
        redirectToLogin(5);
      })
      .catch((e) => {
        const errorMessage = e.response.data.errors[0].title;
        toast.error(errorMessage, { autoClose: 10000 });
      });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      password_confirmation: "",
    },
    validationSchema: resetPassword,
    onSubmit: onSubmitHandler,
  });

  return (
    <div className="auth_form__container">
      <ToastContainer />
      <h1 className="auth_form__h1">Reset your password</h1>
      <form className="auth_form" onSubmit={formik.handleSubmit}>
        <div className="auth_form__formgroup">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="your.email@virginialyons.com"
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
          <label htmlFor="email">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Your new password"
            autoComplete="off"
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
          <label htmlFor="email">Password Confirm</label>
          <input
            type="password"
            name="password_confirmation"
            id="password_confirmation"
            placeholder="Confirm your new password"
            autoComplete="off"
            value={formik.values.password_confirmation}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.errors.password_confirmation && formik.touched.password_confirmation
                ? "input-error"
                : ""
            }
          />
          {formik.errors.password_confirmation && formik.touched.password_confirmation ? (
            <small className="red">{formik.errors.password_confirmation}</small>
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
            {formik.isSubmitting ? "loading..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResetPasswordForm;
