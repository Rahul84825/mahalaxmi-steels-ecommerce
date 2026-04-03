const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const { getHeroImages, addHeroImages, deleteHeroImage } = require("../controllers/heroController");

router.get("/", getHeroImages);
router.post("/add", protect, isAdmin, upload.array("images", 10), addHeroImages);
router.delete("/:id", protect, isAdmin, deleteHeroImage);

module.exports = router;
