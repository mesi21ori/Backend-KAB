import * as yup from "yup";

export const workspaceSchema = yup.object({
  companyType: yup
    .string()
    .oneOf(["design", "construction", "design-construction"])
    .required("Company type is required"),

  companyName: yup.string().trim().min(2).required("Company name is required"),

  companyEmail: yup
    .string()
    .trim()
    .email("Invalid company email")
    .required("Company email is required"),

  phoneNumber: yup.string().trim().required("Phone number is required"),

  address: yup.string().trim().required("Address is required"),

  primaryFullName: yup
    .string()
    .trim()
    .min(2)
    .required("Primary contact full name is required"),

  primaryEmail: yup
    .string()
    .trim()
    .email("Invalid admin email")
    .required("Admin email is required"),

  primaryPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),

  primaryConfirmPassword: yup
    .string()
    .oneOf([yup.ref("primaryPassword")], "Passwords do not match")
    .required("Confirm password is required"),
});