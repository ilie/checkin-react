import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Power } from "lucide-react";
import AuthContext from "../../store/auth-context";

const navElements = [
  { label: "Home", link: "/" },
  { label: "Checkins", link: "/checkins" },
];

// NavLink marks the current page with aria-current, which the underline follows.
const linkClasses =
  "border-b-2 border-transparent pb-0.5 text-white/85 hover:border-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white aria-[current=page]:border-white aria-[current=page]:text-white";

function Nav() {
  const authCtx = useContext(AuthContext);

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
        <li>
          <button
            type="button"
            aria-label="Logout"
            className="flex cursor-pointer rounded-full p-1.5 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
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
