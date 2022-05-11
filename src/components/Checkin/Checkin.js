import classes from "./Checkin.module.css";

function Checkin() {
  const checkinHandler = () => {
    console.log("checkin");
  };
  const checkoutHandler = () => {
    console.log("checkout");
  };
  return (
    <div className={classes.controls}>
      <button onClick={checkinHandler} className={classes.checkin}>
        Checkin / Back
      </button>
      <button onClick={checkoutHandler} className={classes.checkout}>
        Checkout / Break
      </button>
    </div>
  );
}

export default Checkin;
