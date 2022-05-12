import classes from "./Home.module.css";
import Checkin from "../../Checkin/Checkin";
function Home() {
  return (
    <div className={classes.home}>
      <Checkin />
    </div>
  );
}

export default Home;
