import './Table.css';
import {getFormattedTimeDiff,formatDateToES,} from "../../helpers/formatters";

function CheckinsTable(props) {
  const selectRowHandler = (rowId) => {
    props.onSelect(rowId);
  };

  const rows = props.data.map((row) => {
    const startTime = new Date(row.checkin_date + "T" + row.checkin_time);
    const endTime = new Date(row.checkin_date + "T" + row.checkout_time);
    let hours = getFormattedTimeDiff(startTime, endTime);
    if (!row.checkout_time) hours = "Open";
    else if (endTime <= startTime) hours = "Invalid";
    const classNames = [props.selectedRow === row.id ? "selected" : "", row.deleted_at ? "deleted" : ""];

    return (
      <tr
        key={row.id}
        onClick={() => {
          selectRowHandler(row.id);
        }}
        className={classNames.join(" ").trim()}
      >
        <td>
          {row.user_name}
          {row.source === "manual" && <span className="tag">Manual</span>}
          {row.corrections_count > 0 && <span className="tag">Edited ×{row.corrections_count}</span>}
          {row.deleted_at && <span className="tag">Deleted</span>}
        </td>
        <td>{formatDateToES(row.checkin_date)}</td>
        <td>{row.checkin_time}</td>
        <td>{row.checkout_time}</td>
        <td className="hide_on_mobile">{hours}</td>
      </tr>
    );
  });

  return (
    <div className="table__wrapper">
      <table className="table" id="table">
        <thead className="table__head">
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
