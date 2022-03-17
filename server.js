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
const mongoose = require("mongoose");

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
  })
);
// rest api
const RestCustomer = require("./rest-api/customer.js");
const RestAuthentication = require("./rest-api/authentication.js");

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
  RestCustomer(server, Customer);
  RestAuthentication(server, Customer);
}
start();
