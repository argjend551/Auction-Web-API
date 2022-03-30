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

    let soldAuctionCount = await AuctionItem.find({ seller: request.params.id })
      .where("bidWinner").ne(null)
      .count()

    let soldAuction = await AuctionItem.find({ seller: request.params.id })
      .where("bidWinner").ne(null)
      .select("name")
      .select("description")
      .select("bidWinner")
      .select("bidWinOffer")

    let boughtAuctionCount = await AuctionItem.find({ bidWinner: request.params.id }).count();

    let boughtAuction = await AuctionItem.find({ bidWinner: request.params.id })
      .select("name")
      .select("description")
      .select("bidWinner")
      .select("bidWinOffer")

    response.json({
      "My profile": result,
      "Total Sold Auction Items": soldAuctionCount,
      "Sold Auction Items' Detail": soldAuction,
      "Total Bought Auction Items": boughtAuctionCount,
      "Bought Auction Items' Detail": boughtAuction
    });
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
