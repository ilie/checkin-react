import { useContext } from "react";
import classes from "./Footer.module.css";
import AuthContext from "../../store/auth-context";
import { NavLink } from "react-router-dom";
import {
  BsFillHouseDoorFill,
  BsFillClockFill,
  BsFillPersonFill,
} from "react-icons/bs";

const Footer = () => {
  const authCtx = useContext(AuthContext);
  const linkIsActive = (navData) => (navData.isActive ? classes.active : "");

  return (
    <div className={classes.Footer__wrap}>
      <div className="container">
        <div className={classes.Footer}>
          <div className={classes.Footer__element}>
            <NavLink className={linkIsActive} to="/">
              <BsFillHouseDoorFill /> Home
            </NavLink>
          </div>
          <div className={classes.Footer__element}>
            <NavLink className={linkIsActive} to="/checkins">
              <BsFillClockFill />
              Checkins
            </NavLink>
          </div>
          {authCtx.isAdmin && (
            <div className={classes.Footer__element}>
              <NavLink className={linkIsActive} to="/users">
                <BsFillPersonFill />
                Users
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Footer;
