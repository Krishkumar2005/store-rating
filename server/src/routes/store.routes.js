const express = require("express");
const router = express.Router();
const { getStores, submitRating } = require("../controllers/store.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { ratingValidator } = require("../validators");

router.get("/", authenticate, getStores);
router.post(
  "/:storeId/ratings",
  authenticate,
  authorizeRoles("USER"),
  ratingValidator,
  validate,
  submitRating
);

module.exports = router;
