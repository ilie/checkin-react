import classes from "./AdminOptions.module.css";

function AdminOptions(props) {
  const Select = () => {
    return (
      <label className="custom-selector">
        <select
          name="select_user"
          className={classes.selectInput}
          onChange={props.selectOnChange}
          value={props.selectedUser}
        >
          <option key="0" value="0">
            All Users
          </option>
          {props.users.map((user) => {
            return (
              <option key={user.id} value={user.id} defaultValue>
                {user.name}
              </option>
            );
          })}
        </select>
      </label>
    );
  };

  return (
    <div className={classes.options}>
      <div className={classes.left_options}>
        <span className={classes.create + " hide_on_mobile"} onClick={props.onClickCreate}>
          Create New Checkin
        </span>
        <span className={classes.remove + " hide_on_mobile"}>
          Remove Checkin
        </span>
        <span className={classes.edit + " hide_on_mobile"}>Checkin</span>
      </div>
      <div className={classes.right_options}>
        <span>Select a user</span>
        <Select />
      </div>
    </div>
  );
}
export default AdminOptions;
