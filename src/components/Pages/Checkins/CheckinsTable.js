import { getFormattedTimeDiff } from "../../../helpers/formatters";
import "./CheckinsTable.css";

function CheckinsTable(props) {

  const rows = props.data.map((row) => {
    const startTime = new Date(row.checkin_date + "T" + row.checkin_time);
    const endTime = new Date(row.checkin_date + "T" + row.checkout_time);
    const hours = getFormattedTimeDiff(startTime, endTime);

    return (
      <tr key={row.id}>
        <td>{row.user_name}</td>
        <td>{row.checkin_date}</td>
        <td>{row.checkin_time}</td>
        <td>{row.checkout_time}</td>
        <td className="hide_on_mobile">{hours}</td>
      </tr>
    );
  });

  const selectRowHandler = (e) =>{
    console.log(e.tr);
  }

  return (
    <table className="checkins-table">
      <thead>
        <tr onSelect={selectRowHandler}>
          <th>Name</th>
          <th>Date</th>
          <th>Check in</th>
          <th>Check out</th>
          <th className="hide_on_mobile">Working time</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

export default CheckinsTable;
