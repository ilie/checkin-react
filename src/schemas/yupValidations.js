import * as yup from "yup";

const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

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
    .required("Email is required"),
  social_sec_num: yup
    .string()
    .required("Social security number is required")
    .min(12, "Social security number must be 12 characters"),
  hours_on_contract: yup
    .number("Hours must be a number")
    .positive("Hours must be a positive number")
    .integer("Hours must be an integer")
    .required("Hours field is required"),
  is_admin: yup.bool().required('User is admin is required'),
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
  social_sec_num: yup
    .string()
    .required("Social security number is required")
    .min(12, "Social security number must be 12 characters long"),
  hours_on_contract: yup
    .number("Hours must be a number")
    .positive("Hours must be a positive number")
    .integer("Hours must be an integer")
    .required("Hours field is required"),
  is_admin: yup.boolean(),
});
