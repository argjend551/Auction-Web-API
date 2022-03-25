// Bids

module.exports = function (server, Bid) {
  // Add new bid
  server.post("/data/bid", async (request, response) => {
    let buyer = request.body.buyers.buyer;
    let seller = request.body.seller;
    let newBid = request.body.buyers.bidAmount;
    let item = await new Bid(request.body);
    let itemIfExits = await Bid.find({ auctionItem: item.auctionItem });
    let newBuyer = {};
    newBuyer.buyer = request.body.buyers.buyer;
    newBuyer.bidAmount = request.body.buyers.bidAmount;
    let buyersList = await Bid.find({ auctionItem: item.auctionItem }).select("buyers");
    let bidList = buyersList[buyersList.length - 1].buyers;
    let currentBid = bidList[bidList.length - 1].bidAmount;

    if (itemIfExits.length != 0 && buyer !== seller && currentBid < newBid) {
      let item = await Bid.findOneAndUpdate(
        { auctionItem: request.body.auctionItem },
        {
          $push: {
            buyers: newBuyer,
          },
        }
      );
      let result = await item.save();
      return response.json(result);
    } if (newBid == currentBid || newBid < currentBid) {
      return response.json("The bid must be higher than " + currentBid + " kr");
    } if (buyer !== seller && newBid > currentBid) {
      let result = await item.save();
      await response.json(result);
    }
    else {
      response.json("The seller cannot place a bid");
    }
  });

  // Get all bids
  server.get("/data/bid", async (request, response) => {
    let result = await Bid.find();
    response.json(result);
  });

  // Get one bid
  server.get("/data/bid/:id", async (request, response) => {
    let result = await Bid.findById(request.params.id);
    response.json(result);
  });

  // Remove one bid
  server.delete("/data/bid/:id", async (request, response) => {
    let result = await Bid.findByIdAndRemove(request.params.id);
    response.json("One bid is removed");
  });

  // Get bids by customer
  server.get("/data/bid-customer/:id", async (request, response) => {
    let result = await Bid.find({ buyer: request.body.buyers.buyer });
    response.json(result);
  });

};
