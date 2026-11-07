import { Link } from "react-router-dom";
import background from "../../../assets/img/Checkin-bg-Auth.svg";
import logo from "../../../assets/img/Checkin-blue.svg";
import logoDark from "../../../assets/img/Checkin-white.svg";

// The signed-out screens: on desktop the logo, a card with the form and one link below it, on the background image.
// Phones drop the logo, card and image for the plain grouped page (ADR 0003 task 9).
// The background URL is quoted because Vite inlines the small SVG as a data URL. The image is light, so the dark
// theme leaves it out and shows the white logo.
function AuthLayout({ link, linkText, children }) {
  return (
    <div
      className="flex flex-1 items-center justify-center bg-cover bg-center px-4 py-10 md:bg-(image:--auth-bg) md:dark:bg-none max-md:items-start max-md:pb-[calc(2.5rem+env(safe-area-inset-bottom))]"
      style={{ "--auth-bg": `url("${background}")` }}
    >
      <div className="flex w-full max-w-lg flex-col gap-5">
        <img className="ml-4 w-40 max-md:hidden dark:hidden" src={logo} alt="Checkin App" />
        <img className="ml-4 hidden w-40 md:dark:block" src={logoDark} alt="Checkin App" />
        <div className="rounded-2xl bg-cell p-6 shadow-lg md:p-8 max-md:rounded-none max-md:bg-transparent max-md:p-0 max-md:shadow-none">
          {children}
        </div>
        <Link
          to={link}
          className="self-end rounded font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent max-md:self-center max-md:px-2 max-md:py-3 max-md:text-body max-md:font-medium"
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
}

export default AuthLayout;
