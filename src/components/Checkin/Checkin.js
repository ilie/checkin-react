import { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import classes from "./Checkin.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Checkin() {
  const [isLoading, setIsLoading] = useState(true);
  const [checkinStatus, setCheckinStatus] = useState("");
  const [checkinStatusId, setCheckinStatusId] = useState(null);
  const { Axios } = useAxios();

  useEffect(() => {
    getStatus();
  }, [])

  const getStatus =  () => {
    return Axios.get("/checkins/status")
      .then((result) => {
        setIsLoading(false);
        setCheckinStatus(result.data.status);
        setCheckinStatusId(result.data.checkinId);
      })
      .catch((err) => {
        setIsLoading(false);
        toast.error(err.message);
        console.log(err.message);
      });
  };

  const sendPostRequest = (url, body) => {
    setIsLoading(true);
    Axios.post(url, body)
      .then((res) => {
        getStatus();
      })
      .catch((err) => {
        setIsLoading(false);
        toast.error(err.response.data.message);
        getStatus();
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


  let content = <p className={classes.loading}>Loading ...</p>;
  if (!isLoading) {
    if (checkinStatus === "checkin") {
      content = (
        <button onClick={checkoutHandler} className={classes.checkout}>
          Checkout
        </button>
      );
    } else if (checkinStatus === "checkout") {
      content = (
        <button onClick={checkinHandler} className={classes.checkin}>
          Checkin
        </button>
      );
    }
  }

  return (<div>
    <ToastContainer style={{top: '6rem', right: '0.4rem'}}/>
    { content}
    </div>);
}

export default Checkin;
