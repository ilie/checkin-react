import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import useAxios from "../../hooks/useAxios";
import Button from "../UI/Button";
import Field from "../UI/Field";
import { AuthFields, AuthTitle, authButtonClasses } from "./AuthForm";
import { forgotPasswordSchema } from "../../schemas/auth";

function ForgotPasswordForm() {
  const { Axios } = useAxios();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  async function onSubmitHandler(values) {
    try {
      const res = await Axios.post("/forgot-password", values);
      toast.success(res.data.message, { duration: Infinity });
      reset();
    } catch {
      // The same answer either way, so the form doesn't reveal who has an account.
      toast.success("If your email exists in our database, you will receive a reset link.", { duration: Infinity });
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmitHandler)} noValidate>
      <AuthTitle short="Forgot password">Did you forget your password?</AuthTitle>
      <p className="text-sm text-label2 max-md:text-subhead">
        Enter the email address associated with your account, and if we have it in our database we will send you a
        link to reset your password.
      </p>
      <AuthFields>
        <Field id="email" label="Email" grouped error={errors.email?.message}>
          {(props) => (
            <input type="email" placeholder="name@virginialyons.com" autoComplete="email" {...props} {...register("email")} />
          )}
        </Field>
      </AuthFields>
      <Button type="submit" variant="primary" className={authButtonClasses} disabled={!isValid || isSubmitting}>
        {isSubmitting ? "Loading..." : "Continue"}
      </Button>
    </form>
  );
}

export default ForgotPasswordForm;
