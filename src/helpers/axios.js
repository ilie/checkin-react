import axios from "axios";
import { useContext } from "react";
import AuthContext from "../store/auth-context";

export const Axios = () => {
  const ctx = useContext(AuthContext);
  const baseURL = "https://api.checkin.virginialyons.com/api";
  const headers = ctx.isLoggedIn
    ? { Authorization: `Bearer ${ctx.token}` }
    : {};
  const instance = axios.create({
    baseURL: baseURL,
    headers: headers,
  });

  return instance;
};