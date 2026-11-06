import axios from "axios";
import { useContext, useMemo } from "react";
import AuthContext from "../store/auth-context";
import { API_URL } from "../helpers/api";

function useAxios() {
  const { isLoggedIn, token } = useContext(AuthContext);

  const Axios = useMemo(
    () =>
      axios.create({
        baseURL: API_URL,
        headers: isLoggedIn ? { Authorization: `Bearer ${token}` } : {},
      }),
    [isLoggedIn, token],
  );

  return { Axios };
}

export default useAxios;
