import "./Forms.css";
import { useFormik } from "formik";
import useAxios from "../../hooks/useAxios";
import { ToastContainer, toast } from "react-toastify";
import { emailSchema } from "../../schemas/yupValidations";

function ForgotPasswordForm() {
  const { Axios } = useAxios();

  const onSubmitHandler = (values, actions) => {
    const enteredEmail = values.email;
    Axios.post("/forgot-password", { email: enteredEmail }).then((res) => {
      toast.success(res.data.message,{autoClose: false});
      actions.resetForm()
    }).catch((e)=>{
      toast.success('If your email exists in our database, you will receive a reset link.',{autoClose: false});
    });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: emailSchema,
    onSubmit: onSubmitHandler,
  })
  return (
    <div className="auth_form__container">
      <ToastContainer />
      <h1 className="auth_form__h1">Did you forgot your password?</h1>
      <p className="auth_form__info">
        Enter the email address associated with your account, and if we have it in our database we will send you
        a link to reset your password.
      </p>
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
          <button className="form__btn" type="submit" disabled={
              !formik.isValid ||
              (Object.keys(formik.touched).length === 0 &&
                formik.touched.constructor === Object)
            }>
            {formik.isSubmitting ? 'Loading...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ForgotPasswordForm;
