// rating

const customer = require("./customer");

module.exports = function (server, Rating) {
  // Add new bid
  server.post("/data/rate", async (request, response) => {
    // if (request.session.customer) {
    let ratingFrom = request.body.ratingFrom;
    let buyerRating = request.body.buyerRating;
    let sellerRating = request.body.sellerRating;
    let customer = request.body.customer;

    if (ratingFrom == customer) {
      response.json("You cannot rate yourself.");
    } else {
      let item = await new Rating(request.body);
      let result = await item.save();
      await response.json(result);
    }
  });

  // get rating from customer

  server.get("/data/rate/:id", async (request, response) => {
    let item = await Rating.findById(request.params.id)
      .populate({
        path: "customer ratingFrom",
        select: "pictureURL firstname",
      })
      .exec();
    response.json(item);
  });
};
