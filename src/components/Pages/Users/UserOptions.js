import { useState } from "react";
import Modal from "../../UI/Modal/Modal";
import SelectUser from "../../SelectUser";
import classes from './UserOptions.module.css'
import AddUserForm from "../../Forms/AddUserForm";
import EditUserForm from "../../Forms/EditUserForm";
import {AiOutlineUserAdd,AiOutlineUserDelete,AiOutlineUser} from "react-icons/ai";

const UserOptions = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState();

  const hideModalHandler = () => {
    setShowModal(false);
  };
  const onAddHandler = () => {
    setShowModal(true);
    setForm(
      <AddUserForm
        name=''
        nif=''
        email=''
        social_sec_num=''
        hours_on_contract=''
        is_admin=''
        password=''
        password_confirmation=''
        onAddCheckin={props.onAdd}
        hideModal={hideModalHandler}
        editMode={false}
      />
    );
  };

  const onEditHandler = () => {
    setShowModal(true);
    setForm(
      <EditUserForm
        onEditCheckin={props.onEdit}
        hideModal={hideModalHandler}
        singleCheckin={props.singleCheckin}
        selectedRow={props.selectedRow}
      />
    );
  };

  return <div className={classes.options}>
  <div className={classes.left_options}>
    <button
      className={classes.option + " hide_on_mobile"}
      onClick={onAddHandler}
    >
     Add <AiOutlineUserAdd />
    </button>
    <button
      disabled={props.selectedRow === null}
      className={classes.option + " hide_on_mobile"}
      onClick={props.onDelete}
    >
    Delete <AiOutlineUserDelete />
    </button>
    <button
      disabled={props.selectedRow === null}
      className={classes.option + " hide_on_mobile"}
      onClick={onEditHandler}
    >
     Modify <AiOutlineUser />
    </button>
  </div>
  <Modal showModal={showModal}>{form}</Modal>
</div>;
};

export default UserOptions;
