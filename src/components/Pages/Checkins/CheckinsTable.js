import "./CheckinsTable.css";

function CheckinsTable(props) {
  const getTimeDiff = (startTime, endTime) => {
    let diff = Math.abs(endTime - startTime);
    let ms = diff % 1000;
    diff = (diff - ms) / 1000;
    const ss = diff % 60;
    diff = (diff - ss) / 60;
    const mm = diff % 60;
    diff = (diff - mm) / 60;
    const hh = diff % 24;

    if (isNaN(hh) || isNaN(mm) || isNaN(ss)) {
      return "Checkin Incomplete";
    }
    const hours = hh < 10 ? "0" + hh : hh;
    const minutes = mm < 10 ? "0" + mm : mm;
    const seconds = ss < 10 ? "0" + ss : ss;
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    return formattedTime;
  };

  const rows = props.data.map((row) => {
    const startTime = new Date(row.checkin_date + "T" + row.checkin_time);
    const endTime = new Date(row.checkin_date + "T" + row.checkout_time);
    const hours = getTimeDiff(startTime, endTime);
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
  return (
    <div >
      <table className="checkins-table">
        <thead>
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
