import { useState } from "react";
import AuthLayout from "./AuthLayout";
import LoginForm from "../../Forms/LoginForm";
import InstallSheet from "../../Install/InstallSheet";
import { dismissInstallHelp, isInstallHelpDismissed, useInstall } from "../../../pwa/useInstall";

function Login() {
  const { method } = useInstall();
  const [isHelpDismissed, setIsHelpDismissed] = useState(isInstallHelpDismissed);

  // "Not now", the backdrop, a drag or Escape: the help doesn't come back on this device.
  function handleHelpClose() {
    dismissInstallHelp();
    setIsHelpDismissed(true);
  }

  return (
    <AuthLayout link="/forgot-password" linkText="Forgot your password?">
      <title>Sign in · Checkin</title>
      <LoginForm />
      {method === "steps" && !isHelpDismissed && <InstallSheet onClose={handleHelpClose} />}
    </AuthLayout>
  );
}

export default Login;
