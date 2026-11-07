import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Bell, BellOff, Clock, House, Users } from "lucide-react";
import { usePush } from "../../pwa/usePush";
import AuthContext from "../../store/auth-context";

// NavLink marks the current page with aria-current, which the tint follows.
const linkClasses =
  "flex h-8 items-center gap-2 rounded-lg hover:bg-fill focus-visible:outline-2 focus-visible:outline-accent aria-[current=page]:bg-tint aria-[current=page]:font-semibold aria-[current=page]:text-accent dark:aria-[current=page]:bg-white/10 dark:aria-[current=page]:text-label";
// In the toolbar the tabs are grey until chosen; in the sidebar the labels are dark and the icons take the accent,
// as Apple's sidebar guidance has it.
const tabClasses = `${linkClasses} px-3 text-label2 hover:text-label`;
const sidebarClasses = `${linkClasses} px-2.5 text-label [&>svg]:text-accent`;

// The main navigation: tabs across the toolbar, or rows down the sidebar. Apple's guidance keeps segmented
// controls out of main navigation, so these are tabs.
function Nav({ vertical = false }) {
  const authCtx = useContext(AuthContext);
  const classes = vertical ? sidebarClasses : tabClasses;

  return (
    <nav aria-label="Main">
      <ul className={vertical ? "flex flex-col gap-0.5" : "flex gap-1"}>
        <li>
          <NavLink className={classes} to="/" end>
            <House className="size-4" aria-hidden="true" /> Home
          </NavLink>
        </li>
        <li>
          <NavLink className={classes} to="/checkins">
            <Clock className="size-4" aria-hidden="true" /> Check-ins
          </NavLink>
        </li>
        {authCtx.isAdmin && (
          <li>
            <NavLink className={classes} to="/users">
              <Users className="size-4" aria-hidden="true" /> Users
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}

// Desktop's quick way to turn reminders off (ADR 0005); the Me sheet has the same switch.
export function BellButton() {
  const push = usePush();
  if (push.method !== "switch") return null;

  return (
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
      className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-label2 hover:bg-fill hover:text-label focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-60"
      onClick={push.isEnabled ? push.disable : push.enable}
    >
      {push.isEnabled ? (
        <Bell className="size-[18px]" aria-hidden="true" />
      ) : (
        <BellOff className="size-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}

export default Nav;
