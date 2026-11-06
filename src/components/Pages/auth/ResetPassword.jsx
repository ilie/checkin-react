import AuthLayout from "./AuthLayout";
import ResetPasswordForm from "../../Forms/ResetPasswordForm";

function ResetPassword() {
  return (
    <AuthLayout link="/login" linkText="Go back to login page">
      <title>Reset password · Checkin</title>
      <ResetPasswordForm />
    </AuthLayout>
  );
}

export default ResetPassword;
