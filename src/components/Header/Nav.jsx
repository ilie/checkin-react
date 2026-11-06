import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Bell, BellOff, Power } from "lucide-react";
import { usePush } from "../../pwa/usePush";
import AuthContext from "../../store/auth-context";

const navElements = [
  { label: "Home", link: "/" },
  { label: "Checkins", link: "/checkins" },
];

// NavLink marks the current page with aria-current, which the underline follows.
const linkClasses =
  "border-b-2 border-transparent pb-0.5 text-white/85 hover:border-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white aria-[current=page]:border-white aria-[current=page]:text-white";

const iconButtonClasses =
  "flex cursor-pointer rounded-full p-1.5 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white disabled:cursor-default disabled:opacity-60";

function Nav() {
  const authCtx = useContext(AuthContext);
  const push = usePush();

  return (
    <nav>
      <ul className="flex items-center gap-6">
        {navElements.map((navElement) => (
          <li key={navElement.link}>
            <NavLink className={linkClasses} to={navElement.link} end>
              {navElement.label}
            </NavLink>
          </li>
        ))}
        {authCtx.isAdmin && (
          <li>
            <NavLink className={linkClasses} to="/users">
              Users
            </NavLink>
          </li>
        )}
        {/* Desktop's place to turn reminders off (ADR 0005), as the Me sheet's switch is on a phone. */}
        {push.method === "switch" && (
          <li>
            <button
              type="button"
              aria-label="Notifications"
              aria-pressed={push.isEnabled}
              title={
                push.isEnabled
                  ? "Notifications on: reminds you to clock out if you forget"
                  : "Notifications off: turn on to be reminded to clock out"
              }
              disabled={push.isBusy}
              className={iconButtonClasses}
              onClick={push.isEnabled ? push.disable : push.enable}
            >
              {push.isEnabled ? (
                <Bell className="size-6" aria-hidden="true" />
              ) : (
                <BellOff className="size-6 text-white/70" aria-hidden="true" />
              )}
            </button>
          </li>
        )}
        <li>
          <button
            type="button"
            aria-label="Logout"
            className={iconButtonClasses}
            onClick={authCtx.logout}
          >
            <Power className="size-6" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;
