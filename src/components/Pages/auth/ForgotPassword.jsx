import AuthLayout from "./AuthLayout";
import ForgotPasswordForm from "../../Forms/ForgotPasswordForm";

function ForgotPassword() {
  return (
    <AuthLayout link="/login" linkText="« Go back to login page">
      <title>Forgot password · Checkin</title>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

export default ForgotPassword;
