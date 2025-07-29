require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const rateLimit = require('express-rate-limit');
const { attachUser, verifyToken, redirectIfAuthenticated } = require("./middlewares/authMiddleware");
// Import routes and middleware
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require('./routes/listingRoutes');
const Listing = require('./models/Listing'); // Ensure correct path

// Import configs
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Needed to read cookies
app.use(attachUser); // Make `user` available in all routes and views

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
connectDB();

// API Routes
// ✅ Ensure property routes are used
app.use("/api/properties", propertyRoutes);
app.use("/api/auth", authRoutes);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many login attempts, please try again later'
  });

// Frontend Routes
app.use("/", authRoutes); // Auth-related frontend routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

// Home route
app.get("/", (req, res) => {
    console.log("User in home route:", res.locals.user); // For debugging
    res.render("index");
});

// In app.js
app.get("/signup", redirectIfAuthenticated, (req, res) => {
    res.render("signup");
});

// You need to add a login route if you don't have one already
app.get("/login", redirectIfAuthenticated, (req, res) => {
    res.render("login");
});

// Also add it to the password reset routes
app.get("/forgot-password", redirectIfAuthenticated, (req, res) => {
    res.render("forgot-password");
});

app.get("/reset-password/:token", (req, res) => {
    res.render("reset-password", { token: req.params.token });
});

// Route to render the listing form
app.get('/listings/new', (req, res) => {
    res.render('listings/new', { title: 'Create New Listing' });
  });
  
  app.get('/listings/:id', async (req, res) => {
    try {
        const propertyId = req.params.id;
        console.log("Fetching property with ID:", propertyId); // Debugging

        // ✅ Fetch property from the database
        const property = await Listing.findById(propertyId);

        if (!property) {
            console.log("Property not found in database.");
            return res.status(404).render('error', { 
                message: 'Property not found' 
            });
        }

        console.log("Property found:", property); // Debugging

        // ✅ Render the property detail page
        res.render('property-detail', { 
            property: property,
            title: `${property.address} - Property Details`
        });

    } catch (err) {
        console.error('Error fetching property details:', err);
        res.status(500).render('error', { 
            message: 'Server error while fetching property details' 
        });
    }
});

  
  // Route for static properties (using address slug)
  app.get('/property/:slug', (req, res) => {
    const addressSlug = req.params.slug;
    
    // For demo purposes - in production you'd look this up in a database
    // This is just to handle the static property cards
    const staticProperties = [
      {
        id: 'static-1',
        address: '8604 Curly Horse Way #1006',
        city: 'Austin',
        state: 'TX',
        zipcode: '78724',
        price: 105000,
        bedrooms: 4,
        bathrooms: 2,
        squareFeet: 1768,
        propertyType: 'home',
        listingType: 'sale',
        broker: 'MOBILE BYE BYE',
        description: 'Beautiful home in a quiet neighborhood.',
        images: [
          '/image/94f8decded5f4160956fdb73eeed6b7b-p_e.webp',
          '/image/26d1c89a11236da9c4db1740eb72eb49-p_e.webp',
          '/image/70372e4e2904f279fbc9dd7c29fc8cfe-p_e.webp'
        ],
        priceCut: {
          amount: 10000,
          date: '1/27'
        }
      },
      {
        id: 'static-2',
        address: '123 Downtown Ave #301',
        city: 'Austin',
        state: 'TX',
        zipcode: '78701',
        price: 249000,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1200,
        propertyType: 'condo',
        listingType: 'sale',
        broker: 'Austin Downtown Realty',
        description: 'Modern condo in the heart of downtown.',
        images: [
          '/image/3debf302670ccf99512db3eadc4bb0e4-p_e.webp',
          '/image/bdbb205dc38f9af684a1c3850e37ca7c-p_e.webp',
          '/image/065c88e537381d804d0085ab62e08479-p_e.webp'
        ]
      }
    ];
    
    // Find the matching property based on the slug
    const property = staticProperties.find(p => {
      const propertySlug = `${p.address} ${p.city} ${p.state} ${p.zipcode}`
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
      
      return propertySlug.includes(addressSlug);
    });
    
    if (!property) {
      return res.status(404).render('error', { 
        message: 'Property not found' 
      });
    }
    
    // Render the property detail page
    res.render('property-detail', { 
      property: property,
      title: `${property.address} - Property Details`
    });
  });
  
  
  // Route to display all listings
  app.get('/listings', (req, res) => {
    // Here you would typically fetch all listings from your database
    res.render('listings/index', { title: 'All Listings' });
  });
  
  // Edit listing form route
  app.get('/listings/:id/edit', (req, res) => {
    // Here you would fetch the listing data to pre-populate the edit form
    res.render('listings/edit', { 
      title: 'Edit Listing',
      listingId: req.params.id
    });
  });

// Property-related pages
app.get('/create', verifyToken, (req, res) => res.render('create'));
app.get("/sellform2", verifyToken, (req, res) => res.render("sell-2"));
app.get("/sell", (req, res) => res.render("sell"));

// Help and information pages

app.get("/success", (req, res) => res.render("success"));
app.get("/help", (req, res) => res.render("help"));
app.get("/about", (req, res) => res.render("about"));
app.get("/zestimate", (req, res) => res.render("zestimate"));
app.get("/research", (req, res) => res.render("research"));

// Career pages
app.get("/careers", (req, res) => res.render("careers"));
app.get("/careers-us", (req, res) => res.render("careers_us"));
app.get("/careers-mex", (req, res) => res.render("careers_mex"));

// Legal and policy pages
app.get("/cookie", (req, res) => res.render("cookie"));
app.get("/fair", (req, res) => res.render("fairhousing"));
app.get("/advocacy", (req, res) => res.render("advocacy"));
app.get("/terms", (req, res) => res.render("terms"));
app.get("/privacy", (req, res) => res.render("privacy"));
app.get("/ai", (req, res) => res.render("ai"));

// Browse and search pages
app.get("/mobile", (req, res) => res.render("mobile"));
app.get('/browse/homes', (req, res) => res.render('browsehomes'));
app.get('/browse/b', (req, res) => res.render('b'));

// Service pages
app.get("/mortgagerates", (req, res) => res.render("mortgagerates"));
app.get("/rates", (req, res) => res.render("rates"));
app.get("/realestate", (req, res) => res.render("realestate"));
app.get("/homeloans", (req, res) => res.render("homeLoans"));
app.get("/learn", (req, res) => res.render("learn"));
app.get("/findagent", (req, res) => res.render("findagent"));
app.get("/rentals", (req, res) => res.render("managerental"));
app.get("/showing", (req, res) => res.render("showing"));
app.get("/advertise", (req, res) => res.render("advertise"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));