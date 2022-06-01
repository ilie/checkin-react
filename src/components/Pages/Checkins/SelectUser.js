import React from "react";

const SelectUser = (props) => {
  return (
    <select
      name="select_user"
      className="select_user"
      onChange={props.onChange}
      value={props.selctValue}
    >
      <option key="0" value="0">
        {props.firstValue}
      </option>
      {props.users.map((user) => {
        return (
          <option key={user.id} value={user.id} defaultValue>
            {user.name}
          </option>
        );
      })}
    </select>
  );
};

export default SelectUser;
