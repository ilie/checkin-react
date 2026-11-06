import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatTimeToSQL } from "../../helpers/formatters";
import { checkinSchema } from "../../schemas/checkin";
import DialogForm from "./DialogForm";
import Field from "../UI/Field";

// `checkin` is the check-in being edited, or null to add one. Editing keeps the check-in's own user.
function CheckinForm({ checkin, users, formTitle, submitForm, hideModal }) {
  const editMode = checkin !== null;
  const userOptions = editMode ? [{ id: checkin.user_id, name: checkin.user_name }] : users;
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkinSchema),
    mode: "onTouched",
    defaultValues: {
      user: editMode ? String(checkin.user_id) : "",
      date: checkin?.checkin_date ?? "",
      checkin_time: checkin?.checkin_time ?? "",
      checkout_time: checkin?.checkout_time ?? "",
      reason: "",
    },
  });

  function onSubmitHandler(values) {
    submitForm({
      type: "checkin",
      user_id: values.user,
      checkin_date: values.date,
      checkin_time: formatTimeToSQL(values.checkin_time),
      checkout_time: formatTimeToSQL(values.checkout_time),
      reason: values.reason,
    });
    hideModal();
  }

  function error(field) {
    return errors[field]?.message;
  }

  return (
    <DialogForm
      title={formTitle}
      onSubmit={handleSubmit(onSubmitHandler)}
      onCancel={hideModal}
      canSave={isValid && !isSubmitting}
    >
      <Field id="user" label="Select a user" required error={error("user")}>
        {(props) => (
          <select {...props} {...register("user")}>
            {!editMode && <option value="">-- Please select a user --</option>}
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        )}
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="checkin_date" label="Checkin Date" required error={error("date")}>
          {(props) => <input type="date" {...props} {...register("date")} />}
        </Field>
        <Field id="checkin_time" label="Checkin Time" required error={error("checkin_time")}>
          {(props) => <input type="time" step="1" {...props} {...register("checkin_time")} />}
        </Field>
        <Field id="checkout_time" label="Checkout Time" required error={error("checkout_time")}>
          {(props) => <input type="time" step="1" {...props} {...register("checkout_time")} />}
        </Field>
      </div>
      <Field id="reason" label="Reason" required error={error("reason")}>
        {(props) => (
          <textarea rows="3" placeholder="Why is this check-in added or changed?" {...props} {...register("reason")} />
        )}
      </Field>
    </DialogForm>
  );
}

export default CheckinForm;
