import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { CircleUser, Clock, House, Users } from "lucide-react";
import AuthContext from "../../store/auth-context";
import MeSheet from "../Me/MeSheet";

const tabClasses =
  "flex min-h-12 w-20 cursor-pointer flex-col items-center justify-center gap-0.5 text-caption font-semibold text-label2 focus-visible:outline-2 focus-visible:outline-accent aria-[current=page]:text-accent";

// The phone's tab bar and only navigation. It sits at the bottom of the page instead of over it,
// so it never covers the last rows, and reaches the bottom edge past the home indicator.
function Footer() {
  const authCtx = useContext(AuthContext);
  const [isMeOpen, setIsMeOpen] = useState(false);

  function handleMeOpen() {
    setIsMeOpen(true);
  }

  function handleMeClose() {
    setIsMeOpen(false);
  }

  return (
    <>
      <nav
        aria-label="Tabs"
        className="sticky bottom-0 z-30 border-t border-sep/60 bg-cell/90 pt-0.5 pb-[env(safe-area-inset-bottom)] backdrop-blur select-none md:hidden"
      >
        <ul className="flex justify-around">
          <li>
            <NavLink className={tabClasses} to="/" end>
              <House className="size-6" aria-hidden="true" /> Home
            </NavLink>
          </li>
          <li>
            <NavLink className={tabClasses} to="/checkins">
              <Clock className="size-6" aria-hidden="true" /> Check-ins
            </NavLink>
          </li>
          {authCtx.isAdmin && (
            <li>
              <NavLink className={tabClasses} to="/users">
                <Users className="size-6" aria-hidden="true" /> Users
              </NavLink>
            </li>
          )}
          <li>
            <button type="button" className={tabClasses} aria-haspopup="dialog" onClick={handleMeOpen}>
              <CircleUser className="size-6" aria-hidden="true" /> Me
            </button>
          </li>
        </ul>
      </nav>
      {isMeOpen && <MeSheet onClose={handleMeClose} />}
    </>
  );
}

export default Footer;
