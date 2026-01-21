import { useState } from "react";
import Modal from "../../UI/Modal/Modal";
import classes from './UserOptions.module.css'
import UserForm from "../../Forms/UserForm";
import {AiOutlineUserAdd,AiOutlineUserDelete,AiOutlineUser} from "react-icons/ai";

const UserOptions = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState();
  const hideModalHandler = () => {
    props.setSelectedRow(false);
    setShowModal(false);
  };
  const onAddHandler = () => {
    setShowModal(true);
    setForm(
      <UserForm
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
        selectedRow={props.selectedRow}
        editMode={false}
        title='Add new User'
      />
    );
  };

  const onEditHandler = () => {
    setShowModal(true);
    setForm(
      <UserForm
        name={props.singleUser.name}
        nif={props.singleUser.nif}
        email={props.singleUser.email}
        social_sec_num={props.singleUser.social_sec_num}
        hours_on_contract={props.singleUser.hours_on_contract}
        is_admin={props.singleUser.is_admin}
        password=''
        password_confirmation=''
        onAddCheckin={props.onEdit}
        hideModal={hideModalHandler}
        selectedRow={props.selectedRow}
        editMode={true}
        title='Edit User'
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
