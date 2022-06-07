import { useState } from "react";
import SelectUser from "../../SelectUser";
import Modal from "../../UI/Modal/Modal";
import { FiClock } from "react-icons/fi";
import classes from "./CheckinOptions.module.css";
import CheckinForm from "../../Forms/CheckinForm";

const CheckinOptions = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState();

  const singleUser = [{
      id: props.singleCheckin.user_id,
      name: props.singleCheckin.user_name,
    }];

  const onChangeSelectHandler = (e) => {
    props.onFilter(e.target.value);
  };

  const hideModalHandler = () => {
    setShowModal(false);
  };

  const onAddHandler = () => {
    setShowModal(true);
    setForm(
      <CheckinForm
        user=""
        users={props.users}
        checkinDate=""
        checkinTime=""
        checkoutTime=""
        onAddCheckin={props.onAdd}
        hideModal={hideModalHandler}
        formTitle="Add new Checkin"
        submitForm={props.onAdd}
        editMode={false}
      />
    );
  };

  const onEditHandler = () => {
    setShowModal(true);
    setForm(
      <CheckinForm
        user={singleUser}
        users={singleUser}
        checkinDate={props.singleCheckin.checkin_date}
        checkinTime={props.singleCheckin.checkin_time}
        checkoutTime={props.singleCheckin.checkout_time}
        submitForm={props.onEdit}
        hideModal={hideModalHandler}
        formTitle="Edit Checkin"
        singleCheckin={props.singleCheckin}
        selectedRow={props.selectedRow}
        editMode={true}
      />
    );
  };

  return (
    <div className={classes.options}>
      <div className={classes.left_options}>
        <button
          className={classes.option + " hide_on_mobile"}
          onClick={onAddHandler}
        >
          New <FiClock />
        </button>
        <button
          disabled={props.selectedRow === null}
          className={classes.option + " hide_on_mobile"}
          onClick={props.onDelete}
        >
          Remove <FiClock />
        </button>
        <button
          disabled={props.selectedRow === null}
          className={classes.option + " hide_on_mobile"}
          onClick={onEditHandler}
        >
          Edit <FiClock />
        </button>
      </div>
      <div className={classes.right_options}>
        <span>Select a user</span>
        <SelectUser
          users={props.users}
          onChange={onChangeSelectHandler}
          firstValue="All users"
        />
      </div>
      <Modal showModal={showModal}>{form}</Modal>
    </div>
  );
};

export default CheckinOptions;
