const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");

console.log("App starting...");

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);

// Middleware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


app.get("/", (req, res) => {
    console.log("Route handler / called");
    res.send("Server is Working");
});

// Index route - show all listings
app.get("/listings", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
})); 

// New route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    
        let {id} = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/show.ejs", {listing});
    
}));

// Create route
app.post("/listings", wrapAsync(async(req, res, next) => {
        if(!req.body || !req.body.listing) {
            throw new ExpressError(400, "Send valid data for listing")
        }
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    
}));

// Edit route
app.get("/listings/:id/edit",wrapAsync( async (req, res) => {
    
        let {id} = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/edit.ejs", {listing});

}));

// Update route
app.put("/listings/:id", wrapAsync(async (req, res) => {
    if(!req.body || !req.body.listing) {
            throw new ExpressError(400, "Send valid data for listing")
        }
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listings/${id}`);
    
}));

// Delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        res.redirect("/listings");
}));

async function main() {
  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/StayEase', {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
}

main()
.then(() => {
    console.log("Connected to DB");
    app.listen(3000, "127.0.0.1", () => {
        console.log("Server is listening on http://127.0.0.1:3000");
    });
})
.catch(err => console.log(err));

app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
})

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "something went wrong"} = err;
    res.status(statusCode).send(message);
})