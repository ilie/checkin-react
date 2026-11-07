import { useContext, useState } from "react";
import logo from "../../assets/img/Checkin-blue.svg";
import logoDark from "../../assets/img/Checkin-white.svg";
import AuthContext from "../../store/auth-context";
import MeSheet, { initials } from "../Me/MeSheet";
import Nav, { BellButton } from "./Nav";

// Desktop only: a light glass toolbar, as in macOS apps (ADR 0006). Phones use the tab bar instead.
// The initials open the same Me sheet as the phone's Me tab, centred.
function Header() {
  const { user } = useContext(AuthContext);
  const [isMeOpen, setIsMeOpen] = useState(false);

  function handleMeOpen() {
    setIsMeOpen(true);
  }

  function handleMeClose() {
    setIsMeOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-sep/60 bg-cell/70 backdrop-blur-xl select-none max-md:hidden">
        <div className="grid h-13 grid-cols-[1fr_auto_1fr] items-center px-4">
          <div className="flex">
            <img className="h-6 dark:hidden" src={logo} alt="Checkin" />
            <img className="hidden h-6 dark:block" src={logoDark} alt="Checkin" />
          </div>
          <Nav />
          <div className="flex items-center justify-self-end gap-1.5">
            <BellButton />
            <button
              type="button"
              aria-label="Me"
              aria-haspopup="dialog"
              title={user?.name}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-accent text-mac-sub font-bold text-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={handleMeOpen}
            >
              {user ? initials(user.name) : "Me"}
            </button>
          </div>
        </div>
      </header>
      {isMeOpen && <MeSheet onClose={handleMeClose} />}
    </>
  );
}

export default Header;
