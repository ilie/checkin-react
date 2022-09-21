import { useState, Fragment } from "react";
import { NavLink } from "react-router-dom";
import "./Burger.css";

function Burger(props) {
  const [burgerIsOpen, setBurgerIsOpen] = useState(false);

  const toggleHandler = () => {
    setBurgerIsOpen((burgerIsOpen) => !burgerIsOpen);
  };

  const closeSideMenuHandler = () => {
    setBurgerIsOpen(false);
  };

  const addOpenClass = (elementClass) => {
    elementClass = burgerIsOpen ? elementClass + " open" : elementClass;
    return elementClass;
  };
  const linkClasses = (navData) =>
    navData.isActive
      ? "burger__nav__element_a active"
      : "burger__nav__element_a";

  return (
    <Fragment>
      <div className={addOpenClass("burger")} onClick={toggleHandler}>
        <span className="burger__span"></span>
        <span className="burger__span"></span>
        <span className="burger__span"></span>
      </div>
      <nav className={addOpenClass("burger__nav")}>
        <ul>
          {props.navElements.map((navElement) => {
            return (
              <li className="burger__nav__element" key={navElement.id}>
                <NavLink
                  className={linkClasses}
                  to={navElement.link}
                  onClick={closeSideMenuHandler}
                  end
                >
                  {navElement.label}
                </NavLink>
              </li>
            );
          })}
          <li className="burger__nav__element__logout" onClick={props.logOut}>
            Sign Out
          </li>
        </ul>
      </nav>
    </Fragment>
  );
}

export default Burger;
