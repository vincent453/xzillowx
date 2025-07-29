const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../middlewares/authMiddleware");
const Property = require('../models/Listing.js');
const authController = require("../controller/authController");

const router = express.Router();

router.get("/rent", async (req, res) => {
    try {
        // Fetch only rental properties from your database
        const properties = await Property.find({ listingType: 'rent' }).sort({ createdAt: -1 });
        res.render("rent", { 
            properties: properties,
            user: req.user // Pass user info for nav bar
        });
    } catch (error) {
        console.error('Error fetching rental properties:', error);
        res.render("rent", { 
            properties: [],
            user: req.user 
        });
    }
});

// Buy page - show only properties for sale
router.get("/buy", async (req, res) => {
    try {
        // Fetch only properties for sale
        const properties = await Property.find({ listingType: 'sale' }).sort({ createdAt: -1 });
        res.render("buy", { 
            properties: properties,
            user: req.user
        });
    } catch (error) {
        console.error("Error fetching properties for sale:", error);
        res.render("buy", { 
            properties: [],
            user: req.user
        });
    }
});

// Property listing form route - require authentication
router.get("/sellform", verifyToken, (req, res) => {
    res.render("create", { user: req.user });
});



// ✅ Authentication Routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);


module.exports = router;
