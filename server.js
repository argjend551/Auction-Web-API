const express = require("express");
const server = express();
server.use(express.json());

// adding session
session = require("express-session");
server.use(
  session({
    secret: "iejgieohgiehdfgdfgdflg,rrtrp",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// server start
server.listen(3000, () => {
  console.log("server started at http://localhost:3000/data");
});

// Use mongoose
const mongoose = require("mongoose")


// Customer model
const Customer = mongoose.model(
  "Customer",
  new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: { type: String, unique: true, required: true, minlength: 8 },
    password: String,
    pictureURL: String,
    cellphone: String,
    address: {
      street: String,
      city: String,
    },
    publicEmail: String,
    ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
  })
);
//Model and Schema for Categories
const Category = mongoose.model(
  "Category",
  new mongoose.Schema({
    name: String,
    // auctionItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "AuctionItem" }]
  })
);
//Model and Schema for AuctionItem
const AuctionItem = mongoose.model(
  "AuctionItem",
  new mongoose.Schema({
    name: { type: String, required: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    startingPrice: { type: Number, default: 0 },
    reservationPrice: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    itemPicture: [{ type: String, required: true }],
    description: { type: String, required: true },
    status: Boolean,
    bidWinner: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    bidWinOffer: Number,
  })
);

// Bid model
const Bid = mongoose.model(
  "Bid",
  new mongoose.Schema({
    auctionItem: { type: mongoose.Schema.Types.ObjectId, ref: "AuctionItem" },
    buyers: [
      {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
        bidAmount: Number,
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer"
    }
  })
);
// rating model
const Rating = mongoose.model(
  "Rating",
  new mongoose.Schema({
    ratingFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    buyerRating: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
    },
    sellerRating: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  })
);

// rest api
const RestCustomer = require("./rest-api/customer.js");
const RestAuthentication = require("./rest-api/authentication.js");
const RestAuctionItems = require("./rest-api/auctionItems.js");
const RestCategory = require("./rest-api/category.js");

const RestBid = require("./rest-api/bid.js");
const RestRating = require("./rest-api/rating.js");
// Connect to the mongo database atlas
async function start() {
  await mongoose.connect(
    "mongodb+srv://Auctionista_Grupp_C:FjsfzO6md5gq6Idk@cluster-auctionista-gru.ql1dv.mongodb.net/Cluster-Auctionista-Grupp-C?retryWrites=true&w=majority",
    () => {
      console.log("MongoDB Connected");
    },
    (e) => console.error(e)
  );
  // add REST api

  RestCustomer(server, Customer, AuctionItem, Bid)
  RestAuthentication(server, Customer)
  RestAuctionItems(server, AuctionItem, Bid)
  RestCategory(server, Category)
  RestBid(server, Bid, AuctionItem)
  RestRating(server, Rating, Customer);

}
start();
