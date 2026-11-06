import { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAxios from "../../hooks/useAxios";
import Button from "../UI/Button";
import Field from "../UI/Field";
import { AuthFields, AuthTitle, authButtonClasses } from "./AuthForm";
import AuthContext from "../../store/auth-context";
import { apiErrorMessage } from "../../helpers/api";
import { loginSchema } from "../../schemas/auth";

function LoginForm() {
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);
  const { Axios } = useAxios();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  async function loginHandler(values) {
    try {
      const res = await Axios.post("/login", values);
      // Login returns a bare resource, without a JSON:API "data" wrapper.
      const { token, is_admin, name, email, hours_on_contract } = res.data.attributes;
      authCtx.login(token, { id: res.data.id, name, email, hoursOnContract: hours_on_contract });
      authCtx.setAdmin(is_admin);
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(loginHandler)} noValidate>
      <AuthTitle short="Sign in">Sign in to your account</AuthTitle>
      <AuthFields>
        <Field id="email" label="Email" grouped error={errors.email?.message}>
          {(props) => (
            <input type="email" placeholder="name@virginialyons.com" autoComplete="username" {...props} {...register("email")} />
          )}
        </Field>
        <Field id="password" label="Password" grouped error={errors.password?.message}>
          {(props) => (
            <input type="password" placeholder="Required" autoComplete="current-password" {...props} {...register("password")} />
          )}
        </Field>
      </AuthFields>
      <Button type="submit" variant="primary" className={authButtonClasses} disabled={!isValid || isSubmitting}>
        Login
      </Button>
    </form>
  );
}

export default LoginForm;
