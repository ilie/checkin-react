import Burger from "./Burger";
import { useContext } from "react";
import classes from "./Nav.module.css";
import { NavLink } from "react-router-dom";
import svg from "../../assets/img/turn-off.svg";
import AuthContext from "../../store/auth-context";

const Nav = () => {
  const authCtx = useContext(AuthContext);
  const linkIsActive = (navData) => (navData.isActive ? classes.active : "");
  const logoutButton = <img src={svg} alt="Logout" onClick={authCtx.logout} />;
  const isAdmin = authCtx.isAdmin;

  let navElements = [
    {
      id: 1,
      label: "Home",
      link: "/",
    },
    {
      id: 2,
      label: "Checkins",
      link: "/checkins",
    },
  ];

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
          {isAdmin && (
            <li className={classes.main_nav__element}>
              <NavLink className={linkIsActive} to="/users">
                Users
              </NavLink>
            </li>
          )}
          <li className={classes.logoutButton}>{logoutButton}</li>
        </ul>
      </nav>
      <Burger navElements={navElements} logOut={authCtx.logout} />
    </div>
  );
};

export default Nav;
