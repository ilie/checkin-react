import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import AuthContext from "./store/auth-context";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import OfflineBanner from "./components/UI/OfflineBanner";
import { useFlushPendingClock } from "./pwa/offlineClock";
import Home from "./components/Pages/Home/Home";
import Login from "./components/Pages/auth/Login";
import Users from "./components/Pages/Users/Users";
import Checkins from "./components/Pages/Checkins/Checkins";
import ResetPassword from "./components/Pages/auth/ResetPassword";
import ForgotPassword from "./components/Pages/auth/ForgotPassword";

function App() {
  const authCtx = useContext(AuthContext);
  useFlushPendingClock(authCtx.isLoggedIn);

  return (
    // viewport-fit=cover lets the page reach under the status bar, so phones keep clear of it here.
    <div className="flex min-h-dvh flex-col max-md:pt-[env(safe-area-inset-top)]">
      {authCtx.isLoggedIn && <Header />}
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
          <Footer />
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
      {/* Below the desktop header, and below the status bar on phones, which have no header. */}
      <Toaster
        position="top-right"
        richColors
        offset={{ top: "4.5rem", right: "1rem" }}
        mobileOffset={{ top: "calc(env(safe-area-inset-top) + 0.5rem)" }}
      />
    </div>
  );
}

export default App;
