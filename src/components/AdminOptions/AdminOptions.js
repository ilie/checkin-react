import classes from "./AdminOptions.module.css";

function AdminOptions(props) {
  return <div className={classes.AdminOptions}>{props.children}</div>;
}
export default AdminOptions;
