import './Table.css';
import {getFormattedTimeDiff,formatDateToES,} from "../../helpers/formatters";

function CheckinsTable(props) {
  const selectRowHandler = (rowId) => {
    props.onSelect(rowId);
  };

  const rows = props.data.map((row) => {
    const startTime = new Date(row.checkin_date + "T" + row.checkin_time);
    const endTime = new Date(row.checkin_date + "T" + row.checkout_time);
    const hours = getFormattedTimeDiff(startTime, endTime);
    return (
      <tr
        key={row.id}
        onClick={() => {
          selectRowHandler(row.id);
        }}
        className={props.selectedRow === row.id ? "selected" : ""}
      >
        <td>{row.user_name}</td>
        <td>{formatDateToES(row.checkin_date)}</td>
        <td>{row.checkin_time}</td>
        <td>{row.checkout_time}</td>
        <td className="hide_on_mobile">{hours}</td>
      </tr>
    );
  });

  return (
    <div className="checkins-table__wrapper">
      <table className="checkins-table" id="checkins-table">
        <thead className="checkins-table__head">
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Check in</th>
            <th>Check out</th>
            <th className="hide_on_mobile">Working time</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default CheckinsTable;
