import axios from "axios";
import { useContext, useMemo } from "react";
import AuthContext from "../store/auth-context";

const useAxios = () => {
  const ctx = useContext(AuthContext);
  const baseURL = "https://api.checkin.virginialyons.com/api";

  const Axios = useMemo(() => {
    const headers = {};
    if (ctx.isLoggedIn) {
      headers.Authorization = `Bearer ${ctx.token}`;
    }
    return axios.create({
      baseURL: baseURL,
      headers: headers,
    });
  }, [ctx.isLoggedIn, ctx.token]);

  return { Axios };
};

export default useAxios;
