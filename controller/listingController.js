// controllers/listingController.js
const Listing = require('../models/Listing');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require("nodemailer");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/uploads/properties');
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: fileFilter
});

// Middleware to handle file uploads
const uploadMiddleware = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 5 }
]);

// Create new listing
exports.createListing = [
  // 1. Process file uploads
  (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer error (file size, etc)
        return res.status(400).json({ error: `File upload error: ${err.message}` });
      } else if (err) {
        // Other errors
        return res.status(400).json({ error: err.message });
      }
      console.log("User attached to request:", req.user);
      // Continue to next middleware if no errors
      next();
    });
  },


  
  // 2. Process and save the listing
  async (req, res) => {
    try {
      // Check if files were uploaded
      if (!req.files || !req.files.mainImage) {
        return res.status(400).json({ error: 'Main image is required' });
      }
      
      // Process amenities from checkboxes
      let amenities = [];
      if (req.body.amenities) {
        // Handle both array and single value cases
        amenities = Array.isArray(req.body.amenities) 
          ? req.body.amenities 
          : [req.body.amenities];
      }
      
      // Create listing object
      const listingData = {
        // Basic Information
        title: req.body.title,
        price: req.body.price,
        propertyType: req.body.propertyType,
        listingType: req.body.listingType,
        
        // Property Details
        bedrooms: req.body.bedrooms,
        bathrooms: req.body.bathrooms,
        squareFeet: req.body.squareFeet,
        yearBuilt: req.body.yearBuilt,
        
        // Location
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipcode: req.body.zipcode,
        country: req.body.country,
        
        // Images
        mainImage: `/uploads/properties/${req.files.mainImage[0].filename}`,
        additionalImages: req.files.additionalImages 
          ? req.files.additionalImages.map(file => `/uploads/properties/${file.filename}`) 
          : [],
        
        // Description
        description: req.body.description,
        
        // Amenities
        amenities: amenities,
        
        // Contact Information
        contactName: req.body.contactName,
        contactPhone: req.body.contactPhone,
        contactEmail: req.body.contactEmail,
        
        // User information from authentication
        createdBy: req.user.id // Assuming you have authentication middleware
      };
      
      // Create new listing in database
      const newListing = await Listing.create(listingData);
      
      
      // Respond with success
      return res.redirect("/success")
    } catch (error) {
      console.error('Error creating listing:', error);
      
      // If error is validation error, return detailed message
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ 
          success: false,
          error: 'Validation Error', 
          details: messages 
        });
      }
      
      // Generic error
      return res.status(500).json({ 
        success: false,
        error: 'Server Error',
        details: error.message 
      });
    }
  }
];

// Get all listings
exports.getListings = async (req, res) => {
  try {
    // Add query parameters for filtering
    const queryParams = {};
    
    // Filter by property type
    if (req.query.propertyType) {
      queryParams.propertyType = req.query.propertyType;
    }
    
    // Filter by listing type
    if (req.query.listingType) {
      queryParams.listingType = req.query.listingType;
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      queryParams.price = {};
      if (req.query.minPrice) queryParams.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) queryParams.price.$lte = parseInt(req.query.maxPrice);
    }
    
    // Filter by bedrooms/bathrooms
    if (req.query.minBeds) {
      queryParams.bedrooms = { $gte: parseInt(req.query.minBeds) };
    }
    
    if (req.query.minBaths) {
      queryParams.bathrooms = { $gte: parseInt(req.query.minBaths) };
    }
    
    // Search by location
    if (req.query.location) {
      const locationRegex = new RegExp(req.query.location, 'i');
      queryParams.$or = [
        { city: locationRegex },
        { state: locationRegex },
        { zipcode: locationRegex }
      ];
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get listings with pagination
    const listings = await Listing.find(queryParams)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username email'); // Get user info
      
    // Get total count for pagination
    const total = await Listing.countDocuments(queryParams);
    
    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      listings
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server Error',
      details: error.message
    });
  }
};

// Get single listing
exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('createdBy', 'username email');
      
    if (!listing) {
      return res.status(404).json({ 
        success: false,
        error: 'Listing not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      listing
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server Error',
      details: error.message
    });
  }
};

// Update listing
exports.updateListing = [
  // 1. Process file uploads
  (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: `File upload error: ${err.message}` });
      }
      next();
    });
  },
  
  // 2. Update listing
  async (req, res) => {
    try {
      // Find current listing
      let listing = await Listing.findById(req.params.id);
      
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      
      // Check if user owns this listing
      if (listing.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to update this listing' });
      }
      
      // Process amenities from checkboxes
      let amenities = [];
      if (req.body.amenities) {
        amenities = Array.isArray(req.body.amenities) 
          ? req.body.amenities 
          : [req.body.amenities];
      }
      
      // Build update object
      const updateData = {
        title: req.body.title,
        price: req.body.price,
        propertyType: req.body.propertyType,
        listingType: req.body.listingType,
        bedrooms: req.body.bedrooms,
        bathrooms: req.body.bathrooms,
        squareFeet: req.body.squareFeet,
        yearBuilt: req.body.yearBuilt,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipcode: req.body.zipcode,
        country: req.body.country,
        description: req.body.description,
        amenities: amenities,
        contactName: req.body.contactName,
        contactPhone: req.body.contactPhone,
        contactEmail: req.body.contactEmail,
        updatedAt: Date.now()
      };
      
      // Add images if new ones were uploaded
      if (req.files) {
        if (req.files.mainImage) {
          updateData.mainImage = `/uploads/properties/${req.files.mainImage[0].filename}`;
        }
        
        if (req.files.additionalImages) {
          updateData.additionalImages = req.files.additionalImages.map(
            file => `/uploads/properties/${file.filename}`
          );
        }
      }
      
      // Update listing
      listing = await Listing.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      res.status(200).json({
        success: true,
        message: 'Listing updated successfully',
        listing
      });
    } catch (error) {
      console.error('Error updating listing:', error);
      res.status(500).json({ 
        success: false,
        error: 'Server Error',
        details: error.message
      });
    }
  }
];


// Delete listing
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    // Check if user owns this listing
    if (listing.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }
    
    // Delete image files
    if (listing.mainImage) {
      const mainImagePath = path.join(__dirname, '../public', listing.mainImage);
      if (fs.existsSync(mainImagePath)) {
        fs.unlinkSync(mainImagePath);
      }
    }
    
    if (listing.additionalImages && listing.additionalImages.length > 0) {
      listing.additionalImages.forEach(imagePath => {
        const fullPath = path.join(__dirname, '../public', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }
    
    // Delete listing from database
    await listing.remove();
    
    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server Error',
      details: error.message
    });
  }
};

exports.sendContactEmail = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { name, email, phone, message } = req.body;

    console.log(`🔍 Received contact request for listing ID: ${listingId}`);
    console.log("📩 Contact details:", { name, email, phone, message });

    // ✅ Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    // ✅ Find the listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      console.log("❌ Listing not found.");
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // ✅ Get recipient email from listing
    const recipientEmail = listing.contactEmail;
    if (!recipientEmail) {
      console.log("❌ No contact email available for this listing.");
      return res.status(400).json({ success: false, message: 'No contact email available for this listing' });
    }

    console.log("📨 Sending email to:", recipientEmail);

    // ✅ Create email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // ✅ Prepare email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Property Inquiry: ${listing.title || listing.address}`,
      html: `
        <h2>New Property Inquiry</h2>
        <p><strong>Property:</strong> ${listing.address}, ${listing.city}, ${listing.state}</p>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // ✅ Send email
    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent to the property owner!' 
    });

  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    });
  }
};
