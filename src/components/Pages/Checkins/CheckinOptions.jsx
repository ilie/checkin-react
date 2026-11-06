import { useState } from "react";
import Modal from "../../UI/Modal/Modal";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "../../UI/Button";
import CheckinForm from "../../Forms/CheckinForm";

function CheckinOptions(props) {
  // "add", "edit" or null when no form is open.
  const [formMode, setFormMode] = useState(null);

  // Deleted check-ins stay visible for the record but can't be edited or deleted again.
  const canChange = props.selectedRow !== null && !props.singleCheckin.deleted_at;

  const title = formMode === "edit" ? "Edit Checkin" : "Add new Checkin";

  function hideModalHandler() {
    setFormMode(null);
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setFormMode("add")}>
        <Plus className="size-4" aria-hidden="true" /> New
      </Button>
      <Button variant="ghost" disabled={!canChange} onClick={props.onDelete}>
        <Trash2 className="size-4" aria-hidden="true" /> Remove
      </Button>
      <Button variant="ghost" disabled={!canChange} onClick={() => setFormMode("edit")}>
        <Pencil className="size-4" aria-hidden="true" /> Edit
      </Button>
      {/* The form mounts with the dialog, so each opening starts from fresh default values. */}
      {formMode !== null && (
        <Modal onClose={hideModalHandler} label={title}>
          <CheckinForm
            checkin={formMode === "edit" ? props.singleCheckin : null}
            users={props.users}
            formTitle={title}
            submitForm={formMode === "edit" ? props.onEdit : props.onAdd}
            hideModal={hideModalHandler}
          />
        </Modal>
      )}
    </>
  );
}

export default CheckinOptions;
