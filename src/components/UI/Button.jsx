const base =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45";

const variants = {
  primary: "bg-accent text-on-accent hover:enabled:bg-accent/85",
  secondary: "border border-accent bg-cell text-accent hover:enabled:bg-tint",
  plain: "border border-sep bg-cell text-label hover:enabled:bg-fill",
  ghost: "text-label hover:enabled:bg-fill",
};

function Button({ variant = "plain", className = "", type = "button", ...props }) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export default Button;
