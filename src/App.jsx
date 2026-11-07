import { useContext, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import AuthContext from "./store/auth-context";
import Header from "./components/Header/Header";
import Sidebar from "./components/Header/Sidebar";
import Footer from "./components/Footer/Footer";
import MeSheet from "./components/Me/MeSheet";
import OfflineBanner from "./components/UI/OfflineBanner";
import { useFlushPendingClock } from "./pwa/offlineClock";
import { useIsDark } from "./theme";
import { useLayout } from "./layout";
import Home from "./components/Pages/Home/Home";
import Login from "./components/Pages/auth/Login";
import Users from "./components/Pages/Users/Users";
import Checkins from "./components/Pages/Checkins/Checkins";
import ResetPassword from "./components/Pages/auth/ResetPassword";
import ForgotPassword from "./components/Pages/auth/ForgotPassword";

function App() {
  const authCtx = useContext(AuthContext);
  useFlushPendingClock(authCtx.isLoggedIn);
  const isDark = useIsDark();
  // Desktop puts the pages in a sidebar instead of the toolbar if the user chose it in Me (ADR 0006).
  const hasSidebar = useLayout() === "sidebar" && authCtx.isLoggedIn;
  // One Me sheet for the tab bar, the toolbar and the sidebar, so it stays open while the layout changes under it.
  const [isMeOpen, setIsMeOpen] = useState(false);
  // Sign out happens in the sheet; it mustn't open again for whoever signs in next.
  if (isMeOpen && !authCtx.isLoggedIn) setIsMeOpen(false);

  return (
    // viewport-fit=cover lets the page reach under the status bar, so phones keep clear of it here.
    <div className={`flex min-h-dvh flex-col max-md:pt-[env(safe-area-inset-top)] ${hasSidebar ? "md:flex-row" : ""}`}>
      {hasSidebar ? (
        <Sidebar onMeOpen={() => setIsMeOpen(true)} />
      ) : (
        authCtx.isLoggedIn && <Header onMeOpen={() => setIsMeOpen(true)} />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        {authCtx.isLoggedIn ? (
          <>
            <main className="flex flex-1 flex-col">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/checkins" element={<Checkins />} />
                <Route path="/users" element={<Users />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer onMeOpen={() => setIsMeOpen(true)} />
            {isMeOpen && <MeSheet onClose={() => setIsMeOpen(false)} />}
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
      {/* Below the desktop header, and below the status bar on phones, which have no header. */}
      <Toaster
        position="top-right"
        theme={isDark ? "dark" : "light"}
        richColors
        offset={{ top: "4rem", right: "1rem" }}
        mobileOffset={{ top: "calc(env(safe-area-inset-top) + 0.5rem)" }}
      />
    </div>
  );
}

export default App;
