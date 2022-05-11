import { Fragment } from "react";
import classes from "./Home.module.css";
import Checkin from "../../Checkin/Checkin";
function Home() {
  return (
    <div className={classes.home}>
      <h1>Please select one option</h1>
      <div className={classes.options}>
        <Checkin />
      </div>
    </div>
  );
}

export default Home;
