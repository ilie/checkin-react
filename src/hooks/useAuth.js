import { Navigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import AuthContext from "../store/auth-context";

const useAuth = () => {
    useEffect(()=>{
        console.log('use auth');
    });

    const auth = <p>Auth</p>
 return {
     auth
 }
}

export default useAuth;