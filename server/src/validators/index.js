const { body } = require("express-validator");

const passwordRules = body("password")
  .isLength({ min: 8, max: 16 })
  .withMessage("Password must be 8-16 characters")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
  .withMessage("Password must contain at least one special character");

const registerValidator = [
  body("name")
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage("Name must be between 20 and 60 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ max: 400 })
    .withMessage("Address must not exceed 400 characters"),
  passwordRules,
];

const loginValidator = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const updatePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  passwordRules,
];

const createUserValidator = [
  body("name")
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage("Name must be between 20 and 60 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ max: 400 })
    .withMessage("Address must not exceed 400 characters"),
  passwordRules,
  body("role")
    .optional()
    .isIn(["ADMIN", "USER", "STORE_OWNER"])
    .withMessage("Role must be ADMIN, USER, or STORE_OWNER"),
];

const createStoreValidator = [
  body("name")
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage("Store name must be between 20 and 60 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ max: 400 })
    .withMessage("Address must not exceed 400 characters"),
  body("ownerId").notEmpty().withMessage("Owner ID is required"),
];

const ratingValidator = [
  body("value")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
];

module.exports = {
  registerValidator,
  loginValidator,
  updatePasswordValidator,
  createUserValidator,
  createStoreValidator,
  ratingValidator,
};
