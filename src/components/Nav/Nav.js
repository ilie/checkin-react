import classes from "./Nav.module.css";
import { NavLink } from "react-router-dom";

const Nav = (props) => {
  const linkIsActive = (navData) => (navData.isActive ? classes.active : "");
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
  //const checkinsNavElementName = isAdmin ? "Checkins" : "My Checkins";
  if (currentUserisAdmin) {
    navElements[1].label = "Checkins";
    navElements.push({ id: 3, label: "Users", link: "/users" });
  }
  return (
    <nav>
      <ul className={classes.main_nav}>
        {navElements.map((navElement) => {
          console.log(navElement);
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
  );
};

export default Nav;
