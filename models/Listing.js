// models/Listing.js
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['house', 'apartment', 'condo', 'townhouse', 'land']
  },
  listingType: {
    type: String,
    required: true,
    enum: ['sale', 'rent']
  },
  
  // Property Details
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  squareFeet: {
    type: Number,
    required: true,
    min: 0
  },
  yearBuilt: {
    type: Number,
    min: 1800,
    max: 2025
  },
  
  // Location
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipcode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'United States'
  },
  
  // Images
  mainImage: {
    type: String, // Path to main image
    required: true
  },
  additionalImages: [{
    type: String // Array of paths to additional images
  }],
  
  // Description
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Amenities
  amenities: [{
    type: String,
    enum: ['garage', 'pool', 'airConditioning', 'balcony', 'garden', 'fireplace', 'elevator', 'furnished']
  }],
  
  // Contact Information
  contactName: {
    type: String,
    required: true,
    trim: true
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'rented', 'inactive'],
    default: 'active'
  }
});

// Update the updatedAt timestamp on save
listingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Listing', listingSchema);