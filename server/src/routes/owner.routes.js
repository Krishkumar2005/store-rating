const express = require("express");
const router = express.Router();
const { getOwnerDashboard } = require("../controllers/owner.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

router.use(authenticate, authorizeRoles("STORE_OWNER"));

router.get("/dashboard", getOwnerDashboard);

module.exports = router;
