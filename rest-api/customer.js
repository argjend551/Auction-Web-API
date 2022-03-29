// Registration

module.exports = function (server, Customer, AuctionItem, Bid) {
  server.post("/data/customer", async (request, response) => {
    let item = await new Customer(request.body);
    let result = await item.save();
    await response.json(result);
  });

  // GET all customers
  server.get("/data/customer", async (request, response) => {
    let result = await Customer.find();
    response.json(result);
  });

  // GET customers profile
  server.get("/data/customer/profile/:id", async (request, response) => {
    let result = await Customer.findById(request.params.id)
      .select("firstname")
      .select("pictureURL")
      .select("publicEmail")
      .select("review");

    let now = new Date();
    let allSellingAuction = await Bid.find({
      seller: request.params.id
    })
      .populate({
        path: "auctionItem", select: "name endTime status reservationPrice",
        match: { status: { $ne: true } }
      })
    let soldAuction = [];
    for (let auction of allSellingAuction) {
      if (auction.auctionItem !== null) {
        auction.buyers = auction.buyers[auction.buyers.length - 1];
        if (auction.buyers[auction.buyers.length - 1].bidAmount > auction.auctionItem.reservationPrice) {
          soldAuction.push(auction)
        }
      }
    }

    let allBuyingAuction = await Bid.find({ select: "buyers auctionItem" })
      .populate({
        path: "auctionItem", select: "status endTime name reservationPrice", match: {
          status: { $eq: false }, endTime: { $lt: now }
        }
      })
    let boughtAuction = [];
    for (let auction of allBuyingAuction) {
      if (auction.auctionItem !== null) {
        if (auction.buyers[auction.buyers.length - 1].buyer == request.params.id) {
          auction.buyers = auction.buyers[auction.buyers.length - 1];
          if (auction.buyers[auction.buyers.length - 1].bidAmount > auction.auctionItem.reservationPrice) {
            boughtAuction.push(auction)
          }
        }
      }
    }

    response.json({ "My profile": result, "Sold Auctions": soldAuction, "Bought Auctions": boughtAuction });
  });



  // GET customer by id
  server.get("/data/customer/:id", async (request, response) => {
    let result = await Customer.findById(request.params.id);
    response.json(result);
  });

  server.delete("/data/customer/:id", async (request, response) => {
    let result = await Customer.findByIdAndRemove(request.params.id);
    response.json("Customer " + request.body.firstname + " removed");
  });
};
