const express = require("express");
const router = express.Router();
const {
  join,
  login,
  passwordReset,
  passwordResetRequest,
} = require("../controller/UserController");

router.use(express.json());

router.post("/join", join);
router.post("/login", login);
router.post("/reset", passwordResetRequest);
router.put("/reset", passwordReset);

module.exports = router;
