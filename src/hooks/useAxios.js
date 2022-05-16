import axios from "axios";
import { useContext } from "react";
import AuthContext from "../store/auth-context";

const useAxios = () => {
  const ctx = useContext(AuthContext);
  const baseURL = "https://api.checkin.virginialyons.com/api";
  const userIsLoggedIn = ctx.isLoggedIn;

  let headers = {};
  if (userIsLoggedIn) {
    headers.Authorization = `Bearer ${ctx.token}`;
  }

  const Axios = axios.create({
    baseURL: baseURL,
    headers: headers,
  });
  return {
    Axios,
  };
};

export default useAxios;
