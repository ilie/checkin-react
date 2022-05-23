import classes from "./Header.module.css";
import logo from "../../assets/img/Checkin-white.svg";
import MainNav from "../Nav/Nav";
const Header = () => {
  const headerClasses = classes.header + " shadow";
  return (
    <header className={headerClasses}>
      <div className="container flex">
        <div className={classes.header__content}>
          <div className={classes.Logo}>
            <img
              className={classes.Logo}
              src={logo}
              alt="Checkin"
              width="145px"
            />
          </div>
          <MainNav />
        </div>
      </div>
    </header>
  );
};

export default Header;
