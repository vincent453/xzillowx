// routes/listingRoutes.js
const express = require('express');
const router = express.Router();
const listingController = require('../controller/listingController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public routes - no authentication required
router.get('/', listingController.getListings);
router.get('/:id', listingController.getListing);

// Protected routes - authentication required
router.post('/', authenticate, ...listingController.createListing);
router.put('/:id', authenticate, listingController.updateListing);
router.delete('/delete/:id', authenticate, listingController.deleteListing);
router.post('/contact/:listingId', listingController.sendContactEmail);




module.exports = router;