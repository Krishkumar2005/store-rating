const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore,
} = require("../controllers/admin.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { createUserValidator, createStoreValidator } = require("../validators");

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorizeRoles("ADMIN"));

router.get("/dashboard", getDashboard);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUserValidator, validate, createUser);

router.get("/stores", getStores);
router.post("/stores", createStoreValidator, validate, createStore);

module.exports = router;
