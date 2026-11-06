import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAxios from "../../hooks/useAxios";
import DialogForm from "./DialogForm";
import Field from "../UI/Field";
import { addUserSchema, editUserSchema } from "../../schemas/user";

// `user` is the user being edited, or null to add one.
function UserForm({ user, title, onSubmit, hideModal }) {
  const { Axios } = useAxios();
  const editMode = user !== null;

  async function isEmailTaken(email) {
    // encodeURIComponent keeps a "+" in the address from turning into a space.
    const response = await Axios.get(`/users?filter[email]=${encodeURIComponent(email)}`);

    return response.data.meta.total > 0;
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(editMode ? editUserSchema : addUserSchema(isEmailTaken)),
    mode: "onTouched",
    defaultValues: editMode
      ? {
          name: user.name,
          nif: user.nif ?? "",
          email: user.email,
          hours_on_contract: Number(user.hours_on_contract),
          is_admin: user.is_admin ? "1" : "0",
        }
      : { name: "", nif: "", email: "", hours_on_contract: "", is_admin: "", password: "", password_confirmation: "" },
  });

  function onSubmitHandler(values) {
    onSubmit(values);
    hideModal();
  }

  function error(field) {
    return errors[field]?.message;
  }

  return (
    <DialogForm
      title={title}
      onSubmit={handleSubmit(onSubmitHandler)}
      onCancel={hideModal}
      canSave={isValid && !isSubmitting}
    >
      <Field id="name" label="Name and Surname" required error={error("name")}>
        {(props) => <input type="text" placeholder="John Doe" autoComplete="off" {...props} {...register("name")} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="nif" label="NIF" required error={error("nif")}>
          {(props) => <input type="text" placeholder="12345678A" maxLength="9" {...props} {...register("nif")} />}
        </Field>
        <Field id="email" label="Email" required error={error("email")}>
          {(props) => (
            <input
              type="email"
              placeholder="your_email@virginialyons.com"
              autoComplete="off"
              {...props}
              {...register("email")}
            />
          )}
        </Field>
        <Field id="hours" label="Hours on contract" required error={error("hours_on_contract")}>
          {(props) => (
            <input
              type="number"
              placeholder="40"
              min="1"
              max="40"
              step="1"
              {...props}
              {...register("hours_on_contract", { valueAsNumber: true })}
            />
          )}
        </Field>
        <Field id="is_admin" label="User is admin" required error={error("is_admin")}>
          {(props) => (
            <select {...props} {...register("is_admin")}>
              <option value="">Please select</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          )}
        </Field>
      </div>
      {!editMode && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="password" label="Password" required error={error("password")}>
            {(props) => <input type="password" autoComplete="new-password" {...props} {...register("password")} />}
          </Field>
          <Field id="password_confirmation" label="Password confirmation" required error={error("password_confirmation")}>
            {(props) => (
              <input type="password" autoComplete="new-password" {...props} {...register("password_confirmation")} />
            )}
          </Field>
        </div>
      )}
    </DialogForm>
  );
}

export default UserForm;
