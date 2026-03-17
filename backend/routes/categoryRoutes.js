const express = require("express");
const router  = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory, toggleCategory } = require("../controllers/categoryController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.get("/",        getCategories);
router.post("/",       protect, isAdmin, createCategory);
router.put("/:id",     protect, isAdmin, updateCategory);
router.delete("/:id",  protect, isAdmin, deleteCategory);
router.patch("/:id/toggle", protect, isAdmin, toggleCategory);

module.exports = router;
