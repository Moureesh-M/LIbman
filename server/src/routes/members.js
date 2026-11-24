const express = require("express");
const controller = require("../controllers/members");

const router = express.Router();

router.get("/", controller.getMembers);
router.get("/:id", controller.getMember);
router.post("/", controller.createMember);
router.put("/:id", controller.updateMember);
router.delete("/:id", controller.deleteMember);

module.exports = router;
