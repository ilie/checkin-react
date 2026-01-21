import { useEffect } from "react";
import { useFormik } from "formik";
import SelectUser from "../SelectUser";
import { FaRegClock } from "react-icons/fa";
import { BsCalendar3 } from "react-icons/bs";
import TimePickerField from "../UI/TimePickerFiels";
import DatePickerField from "../UI/DatePickerField";
import { formatDateToSQL, formatTimeToSQL } from "../../helpers/formatters";
import { checkinSchema } from "../../schemas/yupValidations";
import "./Forms.css";

const CheckinForm = (props) => {
  const {
    values,
    errors,
    touched,
    isValid,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
  } = useFormik({
    initialValues: {
      user: props.user,
      users: props.users,
      date: props.checkinDate,
      checkin_time: props.checkinTime,
      checkout_time: props.checkoutTime,
    },
    validationSchema: checkinSchema,
    onSubmit: onSubmitHandler,
  });
  useEffect(() => {
    setFieldValue("user", props.user);
    setFieldValue("user", "");
    setFieldValue("users", props.users);
    setFieldValue("date", props.checkinDate);
    setFieldValue("checkin_time", props.checkinTime);
    setFieldValue("checkout_time", props.checkoutTime);

    if (props.editMode) {
      setFieldTouched("user", true);
      setFieldTouched("date", true);
      setFieldTouched("checkin_time", true);
      setFieldTouched("checkout", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.singleCheckin,
    props.user,
    props.users,
    props.checkinDate,
    props.checkinTime,
    props.checkoutTime,
    props.editMode,
  ]);

  function onSubmitHandler(values, actions) {
    const formattedData = {
      type: "checkin",
      user_id: values.user,
      checkin_date: props.editMode ? values.date : formatDateToSQL(values.date),
      checkin_time: formatTimeToSQL(values.checkin_time),
      checkout_time: formatTimeToSQL(values.checkout_time),
    };
    props.submitForm(formattedData);
    props.hideModal();
    actions.resetForm();
  }

  return (
    <div className="checkin_form__div">
      <div className="checkin_form__header">
        <h1 className="checkin_form__h1">{props.formTitle}</h1>
        <p className="user_form__info">
          Fields marked with{" "}
          <span className="red">
            <sup>*</sup>
          </span>{" "}
          are required
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="checkin_form__body">
          <div className="checkin_form__group">
            <label htmlFor="user">
              Selet a user:{" "}
              <span className="red">
                {" "}
                <sup>*</sup>
              </span>
            </label>
            <SelectUser
              name="user"
              users={values.users}
              value={values.user}
              onChange={handleChange}
              onBlur={handleBlur}
              selectValue={values.user}
              firstValue={props.editMode ? null : "-- Please select a user --"}
              defaultValue={values.user}
              className={
                errors.user && touched.user
                  ? "checkin_input input-error"
                  : "checkin_input"
              }
            />
          </div>
          {errors.user && touched.user ? (
            <small className="red align-right mr-35">{errors.user}</small>
          ) : null}
          <div className="checkin_form__group with_icon">
            <label htmlFor="checkin_date">
              Checkin Date:{" "}
              <span className="red">
                {" "}
                <sup>*</sup>
              </span>
            </label>
            <DatePickerField
              name="date"
              value={values.date}
              onChange={setFieldValue}
              className={
                errors.date && touched.date
                  ? "checkin_form__datepicker input-error"
                  : "checkin_form__datepicker"
              }
            />
            <BsCalendar3 className="checkin_form__input__icon" />
          </div>
          {errors.date && touched.date ? (
            <small className="red align-right mr-35">{errors.date}</small>
          ) : null}
          <div className="checkin_form__group with_icon">
            <label htmlFor="checkin_time">
              Checkin Time:
              <span className="red">
                {" "}
                <sup>*</sup>
              </span>
            </label>
            <TimePickerField
              name="checkin_time"
              className={
                errors.checkin_time && touched.checkin_time
                  ? "checkin_form_timepicker checkin_input input-error"
                  : "checkin_form_timepicker checkin_input"
              }
              value={values.checkin_time}
              onChange={setFieldValue}
            />
            <FaRegClock className="checkin_form__input__icon" />
          </div>
          {errors.checkin_time && touched.checkin_time ? (
            <small className="red align-right mr-35">
              {errors.checkin_time}
            </small>
          ) : null}
          <div className="checkin_form__group with_icon">
            <label htmlFor="checkout_time">
              Checkout Time:
              <span className="red">
                {" "}
                <sup>*</sup>
              </span>
            </label>
            <TimePickerField
              name="checkout_time"
              className={
                errors.checkout_time && touched.checkout_time
                  ? "checkin_form_timepicker checkin_input input-error"
                  : "checkin_form_timepicker checkin_input"
              }
              value={values.checkout_time}
              onChange={setFieldValue}
            />
            <FaRegClock className="checkin_form__input__icon" />
          </div>
          {errors.checkout_time && touched.checkout_time ? (
            <small className="red align-right mr-35">
              {errors.checkout_time}
            </small>
          ) : null}
        </div>
        <div className="checkin_formgroup__footer">
          <div className="checkin_formgroup__controls">
            <button
              type="button"
              className="btn-secondary"
              onClick={props.hideModal}
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
        </div>
      </form>
    </div>
  );
};

export default CheckinForm;
