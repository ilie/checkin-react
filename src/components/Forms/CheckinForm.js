import "./Forms.css";
import { useEffect } from "react";
import { useFormik } from "formik";
import SelectUser from "../SelectUser";

import React from "react";

const CheckinForm = (props) => {
  const { values, errors,touched,isValid,handleBlur, handleChange,handleSubmit,setFieldValue} = useFormik({
    initialValues: {
      user: props.user,
      checkin_date: props.checkinDate,
      checkin_time: props.checkinTime,
      checkout_time: props.checkoutTime,
    },
  });
  useEffect(() => {
    setFieldValue("user", props.user);
    setFieldValue("checkin_date", props.checkinDate);
    setFieldValue("checkin_time", props.checkinTime);
    setFieldValue("checkou_time", props.checkoutTime);
  }, [props]);




  return (
    <div className="checkin_form_div">
      <h1 className="checkin_form__h1">{props.formTitile}</h1>
      <p className="user_form__info">
        Fields marked with{" "}
        <span className="red">
          <sup>*</sup>
        </span>{" "}
        are required
      </p>
      <form className="checkin_form" onSubmit={handleSubmit}>
        <div className="checkin_form__group">
          <label htmlFor="users"></label>
        </div>
        <div className="user_formgroup__controls">
            <button type="button" className="btn-secondary" onClick={props.hideModal}>Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </div>
  );
};

export default CheckinForm;
