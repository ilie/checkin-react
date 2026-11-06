const base =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-45";

const variants = {
  primary: "bg-brand text-white hover:enabled:bg-brand/85",
  secondary: "border border-brand bg-white text-brand hover:enabled:bg-brand-50",
  plain: "border border-gray-300 bg-white text-gray-800 hover:enabled:bg-gray-100",
  ghost: "text-gray-800 hover:enabled:bg-gray-100",
};

function Button({ variant = "plain", className = "", type = "button", ...props }) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export default Button;
