import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Drawer from "./components/Drawer/Drawer";
import Home from "./components/Pages/Home/Home";
import Checkins from "./components/Pages/Checkins/Checkins";
import Users from "./components/Pages/Users/Users";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkins" element={<Checkins />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </div>
  );
}

export default App;
