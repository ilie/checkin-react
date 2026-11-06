import { useState } from "react";
import Modal from "../../UI/Modal/Modal";
import Button from "../../UI/Button";
import UserForm from "../../Forms/UserForm";
import { UserMinus, UserPen, UserPlus } from "lucide-react";

function UserOptions(props) {
  // "add", "edit" or null when no form is open.
  const [formMode, setFormMode] = useState(null);

  const title = formMode === "edit" ? "Edit User" : "Add new User";

  function hideModalHandler() {
    props.setSelectedRow(null);
    setFormMode(null);
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setFormMode("add")}>
        <UserPlus className="size-4" aria-hidden="true" /> Add
      </Button>
      <Button variant="ghost" disabled={props.selectedRow === null} onClick={props.onDelete}>
        <UserMinus className="size-4" aria-hidden="true" /> Delete
      </Button>
      <Button variant="ghost" disabled={props.selectedRow === null} onClick={() => setFormMode("edit")}>
        <UserPen className="size-4" aria-hidden="true" /> Modify
      </Button>
      {/* The form mounts with the dialog, so each opening starts from fresh default values. */}
      {formMode !== null && (
        <Modal onClose={hideModalHandler} label={title}>
          <UserForm
            user={formMode === "edit" ? props.singleUser : null}
            title={title}
            onSubmit={formMode === "edit" ? props.onEdit : props.onAdd}
            hideModal={hideModalHandler}
          />
        </Modal>
      )}
    </>
  );
}

export default UserOptions;
