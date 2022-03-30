// rating

const customer = require("./customer");

module.exports = function (server, Rating, AuctionItem) {
  // Add new bid
  server.post("/data/rate", async (request, response) => {
    // if (request.session.customer) {
    let auction = request.body.auctionItem;

    let auctionitem = await AuctionItem.findById(auction);
    let auctionActiv = auctionitem.status;
    let winner = auctionitem.bidWinner;
    let seller = auctionitem.seller;
    let ratingFrom = request.body.ratingFrom;
    let ratingTo = request.body.ratingTo;

    if (ratingFrom !== ratingTo && !auctionActiv) {
      if (ratingFrom == winner || ratingFrom == seller) {
        if (ratingTo == seller || ratingTo == winner) {
          let item = await new Rating(request.body);
          let result = await item.save();
          await response.json(result);
        } else {
          response.json("You are not the bid winner or seller.");
        }
      } else {
        response.json("You are not the bid winner or seller.");
      }
    } else {
      response.json("You cannot rate yourself.");
    }
  });

  // get user rating as seller

  server.get("/data/sellerRate/:id", async (request, response) => {
    let item = await Rating.find({ sellerRating: { $exists: true, $ne: null } })
      .select("sellerRating")
      .where("ratingTo")
      .equals(request.params.id)
      .populate({
        path: "ratingTo ratingFrom",
        select: "pictureURL firstname",
      })
      .exec();
    response.json(item);
  });

  // get user rating as seller
  server.get("/data/buyerRate/:id", async (request, response) => {
    let item = await Rating.find({ buyerRating: { $exists: true, $ne: null } })
      .select("buyerRating")
      .where("ratingTo")
      .equals(request.params.id)
      .populate({
        path: "ratingTo ratingFrom",
        select: "pictureURL firstname",
      })
      .exec();

    response.json(item);
  });
};
