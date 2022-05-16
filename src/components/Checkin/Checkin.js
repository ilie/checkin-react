import { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import classes from "./Checkin.module.css";

function Checkin() {
  const [isLoading, setIsLoading] = useState(true);
  const [checkinStatus, setCheckinStatus] = useState("");
  const [checkinStatusId, setCheckinStatusId] = useState(null);
  const [error, setError] = useState("");
  const { Axios } = useAxios();

  const getStatus = () => {
    return Axios.get("/checkins/status")
      .then((result) => {
        setIsLoading(false);
        setCheckinStatus(result.data.status);
        setCheckinStatusId(result.data.checkinId);
      })
      .catch((err) => {
        setIsLoading(false);
        setError(err.message);
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
        setError(err.response.data.message);
        console.log(err.response.data.message);
      });
  };

  useEffect(() => {
    setIsLoading(true);
    getStatus();
    const dismissError = setTimeout(()=>{
      if(error !== ''){setError('') }
    }, 5000);
    return () => clearTimeout(dismissError);
  }, [checkinStatus, error]);

  const checkinHandler = () => {
    sendPostRequest("/checkins", { type: "checkin", checkin_id: null });
  };
  const checkoutHandler = () => {
    sendPostRequest("/checkins", {
      type: "checkout",
      checkin_id: checkinStatusId,
    });


  };

  let errorMessage = ''
  if(error !== ''){
    errorMessage = <p className={classes.errorMessage}>{error}</p>
  }

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

  return (
    <div>
      {!!error ? errorMessage : content}
    </div>
  );
}

export default Checkin;
