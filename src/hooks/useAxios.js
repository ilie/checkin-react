import axios from "axios";
import { useContext, useMemo } from "react";
import AuthContext from "../store/auth-context";
import { API_URL } from "../helpers/api";

const useAxios = () => {
  const ctx = useContext(AuthContext);

  const Axios = useMemo(() => {
    const headers = {};
    if (ctx.isLoggedIn) {
      headers.Authorization = `Bearer ${ctx.token}`;
    }
    return axios.create({
      baseURL: API_URL,
      headers: headers,
    });
  }, [ctx.isLoggedIn, ctx.token]);

  return { Axios };
};

export default useAxios;
