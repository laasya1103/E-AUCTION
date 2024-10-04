const express = require("express");
const {
	registerUser,
	loginUser,
	getProfile,
	logoutUser,
	getRole
} = require("../controllers/userController");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

router.get('/getRole',  getRole);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/profile", getProfile);
router.post("/logout", logoutUser);

module.exports = router;
