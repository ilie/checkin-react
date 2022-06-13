import { useEffect, useState, useContext } from "react";
import useAxios from "../../hooks/useAxios";
import classes from "./Checkin.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthContext from "../../store/auth-context";

function Checkin() {
  const [isLoading, setIsLoading] = useState(true);
  const [checkinStatus, setCheckinStatus] = useState("");
  const [checkinStatusId, setCheckinStatusId] = useState(null);
  const { Axios } = useAxios();
  const autCtx = useContext(AuthContext);
  useEffect(() => {
    getCheckinStatus();
  }, []);

  const getCheckinStatus = () => {
    return Axios.get("/checkins/status")
      .then((result) => {
        setIsLoading(false);
        setCheckinStatus(result.data.status);
        setCheckinStatusId(result.data.checkinId);
      })
      .catch((err) => {
        setIsLoading(false);
        const errMessage = err.response.data.message;
        if (err.response.status == 401)  autCtx.clearLoginData();
        toast.error(errMessage);
      });
  };

  const sendPostRequest = (url, body) => {
    setIsLoading(true);
    Axios.post(url, body)
      .then((res) => {
        getCheckinStatus();
      })
      .catch((err) => {
        setIsLoading(false);
        toast.error(err.response.data.message);
        getCheckinStatus();
      });
  };

  const checkinHandler = () => {
    sendPostRequest("/checkins", { type: "checkin", checkin_id: null });
  };
  const checkoutHandler = () => {
    sendPostRequest("/checkins", {
      type: "checkout",
      checkin_id: checkinStatusId,
    });
  };

  let content = <p className='loading'>Loading ...</p>;
  if (!isLoading) {
    if (checkinStatus === "checkin") {
      content = (
        <button onClick={checkoutHandler} className={classes.checkin}>
          <span className={classes.ring}></span>
          Checkout
        </button>
      );
    } else if (checkinStatus === "checkout") {
      content = (
        <button onClick={checkinHandler} className={classes.checkin}>
          <span className={classes.ring}></span>
          Checkin
        </button>
      );
    }
  }

  return (
    <div>
      <ToastContainer style={{ top: "6rem", right: "0.4rem" }} />
      {content}
    </div>
  );
}

export default Checkin;
