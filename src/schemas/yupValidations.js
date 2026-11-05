import * as yup from "yup";
import axios from "axios";
import { API_URL } from "../helpers/api";

const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const token = localStorage.getItem("token");

const uniqueEmail = function (value) {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `${API_URL}/users?filter[email]=${value}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        res.data.meta.total === 0 ? resolve(true) : resolve(false);
      });
  });
};

export const addUserSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  nif: yup
    .string()
    .required("NIF is required")
    .min(9, "NIF must be exactly 9 charcaters")
    .max(9, "NIF must be exactly 9 charcaters"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required")
    .test("Unique Email", "This email has already been taken", uniqueEmail),
  hours_on_contract: yup
    .number("Hours must be a number")
    .positive("Hours must be a positive number")
    .integer("Hours must be an integer")
    .required("Hours field is required"),
  is_admin: yup.bool().required("User is admin is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 charcaters long")
    .matches(passwordRules, {
      message:
        "Password needs to be at least 8 charcaters long, include at least one capital letter, one lowercase later, a number and a special character",
    })
    .required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords do not match")
    .required("Password confirmatation is required"),
});

export const editUserSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  nif: yup
    .string()
    .required("NIF is required")
    .min(9, "NIF must be exactly 9 charcaters")
    .max(9, "NIF must be exactly 9 charcaters"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  hours_on_contract: yup
    .number("Hours must be a number")
    .positive("Hours must be a positive number")
    .integer("Hours must be an integer")
    .required("Hours field is required"),
  is_admin: yup.boolean(),
});

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const emailSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
});

export const resetPassword = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 charcaters long")
    .matches(passwordRules, {
      message:
        "Password needs to be at least 8 charcaters long, include at least one capital letter, one lowercase later, a number and a special character",
    })
    .required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords do not match")
    .required("Password confirmatation is required"),
});

export const checkinSchema = yup.object().shape({
  date: yup.date().required('Checkin date is required'),
  checkin_time: yup.string().required("Checkin time is required").nullable(true),
  checkout_time: yup.string().required("Checkout time is required").nullable(true),
  reason: yup.string().trim().required("Please explain why this check-in is added or changed"),
});
