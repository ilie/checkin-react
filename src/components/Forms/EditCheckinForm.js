import './Forms.css';
import DatePicker from "react-datepicker";
import TimePicker from "react-time-picker";
import { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateToSQL } from "../../helpers/formatters";

function EditCheckinForm(props) {
  const [userId, setUserId] = useState(props.singleCheckin.user_id);
  const [userName, setUserName] = useState(props.singleCheckin.user_name);
  const [checkinId, setCheckinId] = useState(props.singleCheckin.id);
  const [checkinDate, setCheckinDate] = useState(
    new Date(props.singleCheckin.checkin_date)
  );
  const [checkinTime, setCheckinTime] = useState(
    props.singleCheckin.checkin_time
  );
  const [checkoutTime, setCheckoutTime] = useState(
    props.singleCheckin.checkout_time
  );

  useEffect(() => {
    setCheckinId(props.singleCheckin.id);
    setUserId(props.singleCheckin.user_id);
    setUserName(props.singleCheckin.user_name);
    setCheckinDate(new Date(props.singleCheckin.checkin_date));
    setCheckinTime(props.singleCheckin.checkin_time);
    setCheckoutTime(props.singleCheckin.checkout_time);
  }, [props.selectedRow]);

  const onChangeUser = (e) => {
    setUserId(e.target.value);
  };
  const onChangeCheckinDate = (date) => {
    setCheckinDate(date);
  };
  const onChangeCheckinTime = (time) => {
    setCheckinTime(time);
  };
  const onChangeCheckoutTime = (time) => {
    setCheckoutTime(time);
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    const editData = {
      id: checkinId,
      checkin_date: formatDateToSQL(checkinDate),
      checkin_time: checkinTime,
      checkout_time: checkoutTime,
      user_id: userId,
      user_name: userName,
    };
    props.onEditCheckin(editData);
    props.hideModal();
  };

  return (
    <div className="checkin_form_div">
      <h1 className="checkin_form__h1"> Edit Checkin </h1>
      <form className="checkin_form" onSubmit={onSubmitHandler}>
        <div className="checkin_form__group">
          <label htmlFor="user">User</label>
          <select className='checkin_form_select' name="user" id="user" onChange={onChangeUser}>
            <option value={props.singleCheckin.user_id}>
              {props.singleCheckin.user_name}
            </option>
          </select>
        </div>
        <div className="checkin_form__group">
          <label htmlFor="checkin_date">Checkin date</label>
          <DatePicker
            className='checkin_date_picker'
            dateFormat="dd/MM/yyyy"
            selected={checkinDate}
            onChange={(date) => onChangeCheckinDate(date)}
            required
          />
        </div>
        <div className="checkin_form__group">
          <label htmlFor="checkin_time">Checkin Time:</label>
          <TimePicker
            className='checkin_form_time-picker'
            locale="es-ES"
            disableClock={true}
            format="HH:mm:ss"
            value={checkinTime}
            onChange={(time) => onChangeCheckinTime(time)}
            required
          />
        </div>
        <div className="checkin_form__group">
          <label htmlFor="checkout_time">Checkout time</label>
          <TimePicker
            className='checkin_form_time-picker'
            locale="es-ES"
            disableClock={true}
            format="HH:mm:ss"
            value={checkoutTime}
            onChange={(time) => onChangeCheckoutTime(time)}
            required
          />
        </div>
        <div className="checkin_form__group">
          <button className="btn-secondary" type="button" onClick={props.hideModal}>
            Cancel
          </button>
          <button className="btn-primary" type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}

export default EditCheckinForm;
