import { useState } from "react";
import Modal from "../../UI/Modal/Modal";
import classes from "./CheckinOptions.module.css";
import { FiClock } from "react-icons/fi";
import AddCheckinForm from "../../Forms/AddCheckinForm";
import EditCheckinForm from "../../Forms/EditCheckinForm";
import SelectUser from "./SelectUser";


const CheckinOptions = (props) => {

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState();

  const onChangeSelectHandler = (e) => {
    props.onFilter(e.target.value);
  };

  const hideModalHandler = () => {
    setShowModal(false);
  };

  const onAddHandler = () => {
    setShowModal(true);
    setForm(
      <AddCheckinForm
        users={props.users}
        onAddCheckin={props.onAdd}
        hideModal={hideModalHandler}
      />
    );
  };

  const onEditHandler = () => {
    setShowModal(true);
    setForm(
      <EditCheckinForm
        onEditCheckin={props.onEdit}
        hideModal={hideModalHandler}
        singleCheckin={props.singleCheckin}
        selectedRow={props.selectedRow}
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
        <SelectUser users={props.users} onChange={onChangeSelectHandler} />
      </div>
      <Modal showModal={showModal}>{form}</Modal>
    </div>
  );
};

export default CheckinOptions;
