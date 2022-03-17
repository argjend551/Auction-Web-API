const express = require("express");
const server = express();
server.listen(3000, () => {
  console.log("server started at http://localhost:3000/data");
});

// Use mongoose
const mongoose = require("mongoose");

// const REST = require("./rest-api.js");

// Connect to the mongo database atlas
async function start() {
  await mongoose.connect(
    "mongodb+srv://Auctionista_Grupp_C:FjsfzO6md5gq6Idk@cluster-auctionista-gru.ql1dv.mongodb.net/Cluster-Auctionista-Grupp-C?retryWrites=true&w=majority"
  );
  // add REST api
  // REST();
}
start();
