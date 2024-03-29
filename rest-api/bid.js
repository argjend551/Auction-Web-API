// Bids

const customer = require("./customer");

module.exports = function (server, Bid, AuctionItem) {
  // Add new bid
  server.post("/data/bid", async (request, response) => {
    // if (request.session.customer) {
    let buyer = request.body.buyers.buyer;
    let seller = request.body.seller;
    let newBid = request.body.buyers.bidAmount;
    let item = await new Bid(request.body);
    let itemIfExits = await Bid.find({ auctionItem: item.auctionItem });
    let auctionitem = await AuctionItem.findById(item.auctionItem);
    let startPrice = auctionitem.startingPrice;
    let auctionActiv = auctionitem.status;
    let auctionEnded = auctionitem.endTime;
    let nowTime = new Date();

    if (auctionActiv && auctionEnded > nowTime) {
      if (itemIfExits != 0) {
        let buyersList = await Bid.find({
          auctionItem: item.auctionItem,
        }).select("buyers");
        let bidList = buyersList[buyersList.length - 1].buyers;
        let currentBid = bidList[bidList.length - 1].bidAmount;
        let currentBuyer = bidList[bidList.length - 1].buyer;
        if (buyer !== seller) {
          if (newBid > startPrice && newBid > currentBid) {
            if (buyer == currentBuyer) {
              let item = await Bid.findOneAndUpdate(
                { auctionItem: request.body.auctionItem },
                { $pull: { buyers: { buyer: currentBuyer, bidAmount: currentBid } } });
              let item2 = await Bid.findOneAndUpdate(
                { auctionItem: request.body.auctionItem },
                { $push: { buyers: { buyer: buyer, bidAmount: newBid } } });
              return response.json("You have the highest bid: " + currentBid + "kr, now is uppdated to " + newBid + " kr");
            } else {
              let item = await Bid.findOneAndUpdate(
                { auctionItem: request.body.auctionItem },
                { $push: { buyers: { buyer: buyer, bidAmount: newBid } } });
              let result = await item.save();
              return response.json(result);
            }
          } else if (
            newBid == currentBid ||
            newBid < currentBid ||
            newBid < startPrice ||
            newBid == startPrice
          ) {
            return response.json(
              "The current bid is " + currentBid + " kr, your bid must be higher than " + currentBid + " kr."
            );
          }
        } else {
          return response.json("The seller cannot place a bid");
        }
      } else if (newBid < startPrice || newBid == startPrice) {
        return response.json("The bid must be higher than starting price: " + startPrice + "kr")
      } else if (buyer == seller) {
        return response.json("The seller cannot place a bid");
      } else {
        let result = await item.save();
        await response.json(result);
      }
    } else {
      return response.json("This auction is not active!");
    }
    // } else {
    //   return response.json("Not logged in");
    // }
  });

  // Get all bids
  server.get("/data/bid", async (request, response) => {
    // if (request.session.customer) {
    let result = await Bid.find();
    response.json(result);
    // } else {
    //   return response.json("Not logged in");
    // }
  });

  // Get all bids with auctionItems (both status: false and status: true)
  server.get("/data/allbids-withAuctionItemDetail", async (request, response) => {
    let result = await Bid.find().populate({
      path: "auctionItem",
      select: "name endTime status bidWinner"
    });
    response.json(result);
  });

  // Get bids that are active with the auctionItems endTime, name, status (true) User story 4 (task 4.2)
  server.get(
    "/data/activeBids-withAuctionItemDetail",
    async (request, response) => {
      let now = new Date();
      let activItemWithBids = await Bid.aggregate([
        {
          $lookup: {
            from: "auctionitems",
            localField: "auctionItem",
            foreignField: "_id",
            as: "Auction-Items",
          }
        },
        { "$unwind": "$Auction-Items" },
        {
          $match:
          {
            $and: [{ "Auction-Items.status": { $eq: true } },
            { "Auction-Items.endTime": { $gt: now } }]
          }
        }, {
          $group: {
            _id: {
              allBids: "$buyers",
              auctionItem: {
                name: "$Auction-Items.name",
                startTime: "$Auction-Items.startTime",
                endTime: "$Auction-Items.endTime",
                seller: "$Auction-Items.seller",
                active: "$Auction-Items.status"
              }
            }
          }
        }
      ])
      response.json(activItemWithBids);
    }
  );

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

  // Get AuctionItems from the same seller
  server.get("/data/sellers/:sellerId", async (request, response) => {
    let seller = await AuctionItem.find().where({ seller: request.params.sellerId });
    response.json(seller);
  });

  // Get bids made by a user. 
  server.get("/data/buyer/:buyerId", async (request, response) => {
    let buyer = await Bid.find().where({ "buyers.buyer": request.params.buyerId }).select("auctionItem").populate({
      path: "auctionItem",
      select: "name"
    });
    response.json(buyer);

  });
};
