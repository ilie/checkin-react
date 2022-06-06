import {useEffect} from 'react';
import { useFormik } from "formik";
import { addUserSchema, editUserSchema } from "../../schemas/yupValidations";

const AddUserForm = (props) => {
  const onSubmitHandler = async (values, actions) => {
    if (props.editMode) {
      delete values.password;
      delete values.password_confirmation;
    }
    props.onAddCheckin(values);
    actions.resetForm();
    props.hideModal();
  };

  const {
    values,
    errors,
    touched,
    isValid,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue
  } = useFormik({
    initialValues: {
      name: props.name,
      nif: props.nif,
      email: props.email,
      social_sec_num: props.social_sec_num,
      hours_on_contract: props.hours_on_contract,
      is_admin: props.is_admin,
      password: "",
      password_confirmation: "",
    },
    validationSchema: props.editMode ? editUserSchema : addUserSchema,
    onSubmit: onSubmitHandler,
  });

  useEffect(()=>{
    setFieldValue('name', props.name);
    setFieldValue('nif', props.nif);
    setFieldValue('email', props.email);
    setFieldValue('social_sec_num', props.social_sec_num);
    setFieldValue('hours_on_contract', props.hours_on_contract);
    setFieldValue('is_admin', props.is_admin);
  }, [props.selectedRow])

  return (
    <div className="user_form_container">
      <div className="user_form__header">
        <h1 className="user_form__h1">{props.title}</h1>
        <p className="user_form__info">
          Fields marked with{" "}
          <span className="red">
            <sup>*</sup>
          </span>{" "}
          are required
        </p>
      </div>
      <div className="user_form__body">
        <form onSubmit={handleSubmit}>
          <div className="user__formgroup">
            <label htmlFor="name">
              Name and Surname:{" "}
              <span className="red">
                {" "}
                <sup>*</sup>
              </span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="John Doe"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.name && touched.name ? "input-error" : ""}
            />
            {errors.name && touched.name ? (
              <small className="red">{errors.name}</small>
            ) : null}
          </div>
          <div className="user__formgroup_oneline">
            <div className="user__formgroup first">
              <label htmlFor="nif">
                NIF:{" "}
                <span className="red">
                  {" "}
                  <sup>*</sup>
                </span>
              </label>
              <input
                type="text"
                name="nif"
                id="nif"
                placeholder="12345678A"
                minLength="9"
                maxLength="9"
                value={values.nif}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.nif && touched.nif ? "input-error" : ""}
              />
              {errors.nif && touched.nif ? (
                <small className="red">{errors.nif}</small>
              ) : null}
            </div>
            <div className="user__formgroup last">
              <label htmlFor="email">
                Email:{" "}
                <span className="red">
                  <sup>*</sup>
                </span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="your_email@virginialyons.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.email && touched.email ? "input-error" : ""}
              />
              {errors.email && touched.email ? (
                <small className="red">{errors.email}</small>
              ) : null}
            </div>
          </div>
          <div className="user__formgroup">
            <label htmlFor="nif">
              S.S. number:{" "}
              <span className="red">
                {" "}
                <sup>*</sup>
              </span>
            </label>
            <input
              type="text"
              name="social_sec_num"
              id="ss"
              placeholder="Social security no. Ex: 221006782335"
              minLength="12"
              maxLength="12"
              value={values.social_sec_num}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                errors.social_sec_num && touched.social_sec_num
                  ? "input-error"
                  : ""
              }
            />
            {errors.social_sec_num && touched.social_sec_num ? (
              <small className="red">{errors.social_sec_num}</small>
            ) : null}
          </div>
          <div className="user__formgroup_oneline">
            <div className="user__formgroup half">
              <label htmlFor="hours">
                Hours on contract:
                <span className="red">
                  {" "}
                  <sup>*</sup>
                </span>
              </label>
              <input
                type="number"
                name="hours_on_contract"
                id="hours"
                placeholder="40"
                min="0"
                max="40"
                step="1"
                value={values.hours_on_contract}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  errors.hours_on_contract && touched.hours_on_contract
                    ? "input-error"
                    : ""
                }
              />
              {errors.hours_on_contract && touched.hours_on_contract ? (
                <small className="red">{errors.hours_on_contract}</small>
              ) : null}
            </div>
            <div className="user__formgroup half">
              <label htmlFor="is_admin">
                User is admin:{" "}
                <span className="red">
                  {" "}
                  <sup>*</sup>
                </span>
              </label>
              <select
                name="is_admin"
                id="is_admin"
                value={values.is_admin}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  errors.is_admin && touched.is_admin ? "input_error" : ""
                }
              >
                <option value="">Please select</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
              {errors.is_admin && touched.is_admin ? (
                <small className="red">{errors.is_admin}</small>
              ) : null}
            </div>
          </div>
          {!props.editMode && (
            <>
              <div className="user__formgroup">
                <label htmlFor="password">
                  Password:
                  <span className="red">
                    {" "}
                    <sup>*</sup>
                  </span>
                </label>{" "}
                <input
                  type="password"
                  name="password"
                  id="password"
                  minLength="8"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.password && touched.password ? "input-error" : ""
                  }
                />
                {errors.password && touched.password ? (
                  <small className="red">{errors.password}</small>
                ) : null}
              </div>
              <div className="user__formgroup">
                <label htmlFor="password_confirmation">
                  Password confirmation:{" "}
                  <span className="red">
                    {" "}
                    <sup>*</sup>
                  </span>
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  id="password_confirmation"
                  minLength="8"
                  value={values.password_confirmation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.password_confirmation &&
                    touched.password_confirmation
                      ? "input-error"
                      : ""
                  }
                />
                {errors.password_confirmation &&
                touched.password_confirmation ? (
                  <small className="red">{errors.password_confirmation}</small>
                ) : null}
              </div>
            </>
          )}
          <div className="user_formgroup__controls">
            <button
              type="button"
              onClick={props.hideModal}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={
                !isValid ||
                (Object.keys(touched).length === 0 &&
                  touched.constructor === Object)
              }
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;
