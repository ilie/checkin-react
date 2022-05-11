import React, { Fragment } from "react";
import { Routes, Route } from "react-router-dom";
import Auth from "./auth/Auth";
import Header from "./components/Header/Header";
import Home from "./components/Pages/Home/Home";
import Checkins from "./components/Pages/Checkins/Checkins";
import Users from "./components/Pages/Users/Users";
import Modal from "./components/UI/Modal/Modal";
import "./App.css";
const isAuth = false;
function App() {
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
