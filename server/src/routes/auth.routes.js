const express = require("express");
const router = express.Router();
const { register, login, getMe, updatePassword } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  registerValidator,
  loginValidator,
  updatePasswordValidator,
} = require("../validators");

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", authenticate, getMe);
router.patch("/update-password", authenticate, updatePasswordValidator, validate, updatePassword);

module.exports = router;
