const express = require("express");
const controller = require("../controllers/borrowings");

const router = express.Router();

router.post("/", controller.borrowBook);
router.patch("/:id/return", controller.returnBook);

module.exports = router;
