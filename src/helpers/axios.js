import axios from "axios";
import { useContext } from "react";
import AuthContext from "../store/auth-context";
import { API_URL } from "./api";

export const Axios = () => {
  const ctx = useContext(AuthContext);
  const headers = ctx.isLoggedIn
    ? { Authorization: `Bearer ${ctx.token}` }
    : {};
  const instance = axios.create({
    baseURL: API_URL,
    headers: headers,
  });

  return instance;
};