// Bids

module.exports = function (server, Bid) {
  // Add new bid
  server.post("/data/bid", async (request, response) => {

    let item = await new Bid(request.body);
    let x = await Bid.find({ "auctionItem": item.auctionItem })
    let newBuyer = {};
    newBuyer.buyer = request.body.buyers.buyer;
    newBuyer.bidAmount = request.body.buyers.bidAmount;
    if (x.length != 0) {
      let item = await Bid.findOneAndUpdate({ "auctionItem": request.body.auctionItem }, {
        $push: {
          "buyers": newBuyer
        }
      });
      let result = await item.save();
      response.json(result);
    }
    else {
      let result = await item.save();
      await response.json(result);
    }
  });

  // Get all bids
  server.get("/data/bid", async (request, response) => {
    let result = await Bid.find();
    response.json(result);
  });

  // Get one bids
  server.get("/data/bid/:id", async (request, response) => {
    let result = await Bid.findById(request.params.id);
    response.json(result);
  });

  // Remove the bid
  server.delete("/data/bid/:id", async (request, response) => {
    let result = await Bid.findByIdAndRemove(request.params.id);
    response.json("One bid is removed");
  });
};