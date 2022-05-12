import { useEffect, useState } from "react";
import classes from "./Checkin.module.css";

function Checkin() {
  const [checkin, setCheckin] = useState(true);
  useEffect(() => {
    console.log("Checkin.js");
  }, []);

  const checkinHandler = () => {
    console.log("checkin");
  };
  const checkoutHandler = () => {
    console.log("checkout");
  };

  const btn = !checkin ? (
    <button onClick={checkinHandler} className={classes.checkin}>
      Checkin / Back
    </button>
  ) : (
    <button onClick={checkoutHandler} className={classes.checkout}>
      Checkout / Break
    </button>
  );

  return <div>{btn}</div>;
}

export default Checkin;
