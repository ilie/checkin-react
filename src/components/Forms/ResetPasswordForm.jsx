import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAxios from "../../hooks/useAxios";
import Button from "../UI/Button";
import Field from "../UI/Field";
import { AuthFields, AuthTitle, authButtonClasses } from "./AuthForm";
import { apiErrorMessage } from "../../helpers/api";
import { resetPasswordSchema } from "../../schemas/auth";

function ResetPasswordForm() {
  const { Axios } = useAxios();
  const navigate = useNavigate();
  // The reset link carries the token as everything after the "?".
  const token = window.location.href.split("?")[1];
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", password_confirmation: "" },
  });

  async function onSubmitHandler(values) {
    try {
      const res = await Axios.post("/reset-password", { token, ...values });
      toast.success(res.data.message);
      setTimeout(() => navigate("/login"), 5000);
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0]?.title ?? apiErrorMessage(error), { duration: 10000 });
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmitHandler)} noValidate>
      <AuthTitle short="Reset password">Reset your password</AuthTitle>
      <AuthFields>
        <Field id="email" label="Email" grouped error={errors.email?.message}>
          {(props) => (
            <input
              type="email"
              placeholder="name@virginialyons.com"
              autoComplete="username"
              {...props}
              {...register("email")}
            />
          )}
        </Field>
        <Field id="password" label="Password" grouped error={errors.password?.message}>
          {(props) => (
            <input
              type="password"
              placeholder="Your new password"
              autoComplete="new-password"
              {...props}
              {...register("password")}
            />
          )}
        </Field>
        <Field id="password_confirmation" label="Confirm" grouped error={errors.password_confirmation?.message}>
          {(props) => (
            <input
              type="password"
              placeholder="Repeat the new password"
              autoComplete="new-password"
              {...props}
              {...register("password_confirmation")}
            />
          )}
        </Field>
      </AuthFields>
      <Button type="submit" variant="primary" className={authButtonClasses} disabled={!isValid || isSubmitting}>
        {isSubmitting ? "Loading..." : "Continue"}
      </Button>
    </form>
  );
}

export default ResetPasswordForm;
