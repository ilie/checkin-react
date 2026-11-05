import { useState } from "react";
import Modal from "../../UI/Modal/Modal";
import { FiClock } from "react-icons/fi";
import classes from "./CheckinOptions.module.css";
import CheckinForm from "../../Forms/CheckinForm";

const CheckinOptions = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState();

  // Deleted check-ins stay visible for the record but can't be edited or deleted again.
  const canChange = props.selectedRow !== null && !props.singleCheckin.deleted_at;

  const singleUser = [{
      id: props.singleCheckin.user_id,
      name: props.singleCheckin.user_name,
    }];

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
          disabled={!canChange}
          className={classes.option + " hide_on_mobile"}
          onClick={props.onDelete}
        >
          Remove <FiClock />
        </button>
        <button
          disabled={!canChange}
          className={classes.option + " hide_on_mobile"}
          onClick={onEditHandler}
        >
          Edit <FiClock />
        </button>
      </div>
      <Modal showModal={showModal}>{form}</Modal>
    </div>
  );
};

export default CheckinOptions;
