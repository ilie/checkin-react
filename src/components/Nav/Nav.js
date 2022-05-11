import classes from "./Nav.module.css";
import { NavLink } from "react-router-dom";
import Burger from "./Burger";
const Nav = (props) => {
  const linkIsActive = (navData) => (navData.isActive ? classes.active : "");
  const isLoggedIn = false;
  const currentUserisAdmin = false; // Remove me later this should be passed by props
  let navElements = [
    {
      id: 1,
      label: "Home",
      link: "/",
    },
    {
      id: 2,
      label: "My Checkins",
      link: "/checkins",
    },
  ];
  if (isLoggedIn) {
    navElements.push({ id: 4, label: "Logout", link: "/logout" });
  } else {
    navElements.push({ id: 4, label: "Login", link: "/login" });
  }

  if (currentUserisAdmin) {
    navElements[1].label = "Checkins";
    navElements.push({ id: 4, label: "Users", link: "/users" });
  }
  return (
    <div>
      <nav className={classes.main_nav_wrapper}>
        <ul className={classes.main_nav}>
          {navElements.map((navElement) => {
            return (
              <li className={classes.main_nav__element} key={navElement.id}>
                <NavLink className={linkIsActive} to={navElement.link}>
                  {navElement.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <Burger navElements={navElements} />
    </div>
  );
};

export default Nav;
