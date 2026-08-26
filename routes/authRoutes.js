const express = require("express");

const {
    signup,
    login,
    getCurrentUser,
    logout
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);
router.post("/logout", logout);

module.exports = router;