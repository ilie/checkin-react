import "./Table.css";

import React from "react";

const UsersTable = (props) => {

    const rows = props.users.map((user) =>{
        return(
            <tr key={user.id}>
                <td>{user.name}</td>
                <td className="hide_on_mobile">{user.nif}</td>
                <td>{user.email}</td>
                <td className="hide_on_mobile">{user.social_sec_num}</td>
                <td className="hide_on_mobile">{user.hours_on_contract} h</td>
                <td className="hide_on_mobile">{user.is_admin}</td>
              </tr>
        )
    })

  return (
    <div className="table__wrapper">
      <table className="table" id="table">
        <thead className="table__head">
          <tr>
            <th>Name</th>
            <th className="hide_on_mobile">NIF</th>
            <th>Email</th>
            <th className="hide_on_mobile">SS number</th>
            <th className="hide_on_mobile">Contract</th>
            <th className="hide_on_mobile">Admin</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
