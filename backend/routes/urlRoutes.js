const express = require("express");
const {
  shortenUrl,
  redirectToUrl,
} = require("../controllers/urlShortenerController");

const router = express.Router();

router.post("/api/shorten", shortenUrl);
router.get("/:code", redirectToUrl);

module.exports = router;
