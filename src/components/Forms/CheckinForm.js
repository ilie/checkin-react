import { useRef } from "react";

function AddCheckinForm(props) {
  const refUser = useRef();
  const refDate = useRef();
  const refIn = useRef();
  const refOut = useRef();

  const onSubmitHandler = (e) => {
    e.preventDefault();
    const data = {
      type: "checkin",
      user_id: refUser.current.value,
      checkin_date: refDate.current.value,
      checkin_time: refIn.current.value,
      checkout_time: refOut.current.value,
    };
    props.onAddCheckin(data);
  };
  return (
    <form className="checkinForm" onSubmit={onSubmitHandler}>
      <div className="checkinForm__group">
        <label htmlFor="user">User</label>
        <select name="user" id="user" ref={refUser}>
          {props.users.map((user) => {
            return (
              <option key={user.id} value={user.id} defaultValue={props.userId}>
                {user.name}
              </option>
            );
          })}
        </select>
      </div>
      <div className="checkinForm__group">
        <label htmlFor="checkin_date">Checkin date</label>
        <input
          type="date"
          name="checkin_date"
          id="checkin_date"
          value={props.checkin_date}
          ref={refDate}
        />
      </div>
      <div className="checkinForm__group">
        <label htmlFor="checkin_time">
          <input
            type="time"
            name="checkin_time"
            id="checkin_time"
            value={props.checkin_time}
            ref={refIn}
          />
        </label>
      </div>
      <div className="checkinForm__group">
        <label htmlFor="checkout_time">Checkout time</label>
        <input
          type="time"
          name="checkout_time"
          id="checkout_time"
          value={props.checkout_time}
          ref={refOut}
        />
      </div>
      <div className="checkinForm__group">
        <button type="cancel">Cancel</button>
        <button type="submit">Add</button>
      </div>
    </form>
  );
}

export default AddCheckinForm;
