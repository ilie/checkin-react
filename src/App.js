import "./App.css";
import Auth from "./auth/Auth";
import AuthContext from "./store/auth-context";
import Header from "./components/Header/Header";
import Home from "./components/Pages/Home/Home";
import { Routes, Route } from "react-router-dom";
import Users from "./components/Pages/Users/Users";
import React, { Fragment, useContext } from "react";
import Checkins from "./components/Pages/Checkins/Checkins";

function App() {
  const authCtx = useContext(AuthContext);
  const isAuth = authCtx.isLoggedIn;

  let app = (
    <Fragment>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkins" element={<Checkins />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </Fragment>
  );
  if (!isAuth) {
    app = <Auth />;
  }
  return <div className="App">{app}</div>;
}

export default App;
