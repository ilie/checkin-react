import { useContext } from "react";
import AuthContext from "../../store/auth-context";
import { initials } from "../Me/MeSheet";
import { Logo } from "./Header";
import MeButton from "./MeButton";
import Nav, { BellButton } from "./Nav";

// Desktop's other layout, chosen in Me (ADR 0006): a floating glass sidebar like macOS 26 Mail, with the pages,
// and at the bottom who is signed in, which opens Me, and the reminders bell.
function Sidebar({ onMeOpen }) {
  const { user } = useContext(AuthContext);

  return (
    <aside className="sticky top-2.5 z-40 m-2.5 mr-0 flex h-[calc(100dvh-1.25rem)] w-58 shrink-0 flex-col gap-3 rounded-2xl border border-sep/40 bg-cell/60 p-2.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,.18)] backdrop-blur-xl select-none max-md:hidden">
      <div className="px-1.5 pt-1.5">
        <Logo />
      </div>
      <Nav vertical />
      <div className="mt-auto flex items-center gap-1">
        <MeButton
          onClick={onMeOpen}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-xl p-1.5 text-left hover:bg-fill focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-mac-sub font-bold text-on-accent"
          >
            {user ? initials(user.name) : "Me"}
          </span>
          {user && (
            <span aria-hidden="true" className="min-w-0">
              <span className="block truncate font-semibold">{user.name}</span>
              <span className="block truncate text-mac-sub text-label2">{user.email}</span>
            </span>
          )}
        </MeButton>
        <BellButton />
      </div>
    </aside>
  );
}

export default Sidebar;
