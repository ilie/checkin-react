import "./Forms.css";
import { useState } from "react";
import DatePicker from "react-datepicker";
import TimePicker from "react-time-picker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateToSQL } from "../../helpers/formatters";

function AddCheckinForm(props) {
  const [date, setDate] = useState("");
  const [userId, setUserId] = useState("");
  const [checkinTime, setCheckinTime] = useState("");
  const [checkoutTime, setCheckoutTime] = useState("");

  const userIdChangeHandler = (e) => {
    setUserId(e.target.value);
  };

  const onDateChangeHandler = (date) => {
    setDate(new Date(date));
  };

  const checkInTimeHandler = (time) => {
    setCheckinTime(time);
  };

  const checkoutTimeHandler = (time) => {
    setCheckoutTime(time);
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    const data = {
      type: "checkin",
      user_id: userId,
      checkin_date: formatDateToSQL(date),
      checkin_time: checkinTime,
      checkout_time: checkoutTime,
    };
    props.hideModal();
    props.onAddCheckin(data);

    setDate('');
    setUserId('');
    setCheckinTime('');
    setCheckoutTime('');
  };
  return (
    <div className="checkin_form_div">
      <h1 className="checkin_form__h1"> Add Checkin </h1>
      <form className="checkin_form" onSubmit={onSubmitHandler}>
        <div className="checkin_form__group">
          <label htmlFor="user">User</label>
          <select className='checkin_form_select' name="user" id="user" onChange={userIdChangeHandler}>
            {props.users.map((user) => {
              return (
                <option
                  key={user.id}
                  value={user.id}
                  defaultValue={props.userId}
                >
                  {user.name}
                </option>
              );
            })}
          </select>
        </div>
        <div className="checkin_form__group">
          <label htmlFor="checkin_date">Checkin date</label>
          <DatePicker
            className='checkin_date_picker'
            dateFormat="dd/MM/yyyy"
            selected={date}
            onChange={(date) => onDateChangeHandler(date)}
          />
        </div>
        <div className="checkin_form__group">
          <label htmlFor="checkin_time">Checkin time </label>
          <TimePicker
            className="checkin_form_time-picker"
            locale="es-ES"
            disableClock={true}
            format="HH:mm"
            value={checkinTime}
            onChange={(time) => checkInTimeHandler(time)}
          />
        </div>
        <div className="checkin_form__group">
          <label htmlFor="checkout_time">Checkout time</label>
          <TimePicker
            className="checkin_form_time-picker"
            locale="es-ES"
            disableClock={true}
            format="HH:mm"
            value={checkoutTime}
            onChange={(time) => checkoutTimeHandler(time)}
          />
        </div>
        <div className="checkin_form__group">
          <button
            type="button"
            className="btn-secondary"
            onClick={props.hideModal}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCheckinForm;
