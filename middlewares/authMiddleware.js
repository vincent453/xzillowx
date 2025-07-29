const jwt = require("jsonwebtoken");
const User = require("../models/User");


// Middleware to attach user to every response
const attachUser = (req, res, next) => {
    const token = req.cookies?.token;
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Make user available in request object
            res.locals.user = decoded; // Make user available in all EJS templates
        } catch (error) {
            req.user = null;
            res.locals.user = null; // Invalid token, reset user
        }
    } else {
        req.user = null;
        res.locals.user = null; // No token, user is not logged in
    }
    next();
};


const verifyToken = (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded user:", decoded);  // 🔹 Debugging
        req.user = decoded;  // Ensure it includes `_id`
        next();
    } catch (err) {
        return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
};



// Redirect If User is Already Logged In
// In authMiddleware.js
const redirectIfAuthenticated = (req, res, next) => {
    const token = req.cookies?.token;
    
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect("/"); // Redirect to home if user is logged in
        } catch (error) {
            // Invalid token, continue to login/signup page
        }
    }
    next();
};

// authMiddleware.js - Update the exports
module.exports = { 
    attachUser, 
    redirectIfAuthenticated, 
    verifyToken,
    authenticate: verifyToken // Add this alias for consistency
  };