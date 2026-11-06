import logo from "../../assets/img/Checkin-white.svg";
import Nav from "./Nav";

function Header() {
  // Desktop only: native apps show no logo bar, and the tab bar is the phone's navigation.
  return (
    <header className="sticky top-0 z-40 bg-brand text-white shadow-md max-md:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
        <img className="h-[30px]" src={logo} alt="Checkin" />
        <Nav />
      </div>
    </header>
  );
}

export default Header;
