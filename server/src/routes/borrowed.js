const express = require("express");
const controller = require("../controllers/borrowed");

const router = express.Router();

router.get("/idle-members", controller.getIdleMembers);
router.get("/", controller.getBorrowed);

module.exports = router;
