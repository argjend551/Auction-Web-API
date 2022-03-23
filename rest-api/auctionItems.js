module.exports = function (server, AuctionItem, Bid) {
  //to add an auctionItem
  server.post("/data/auctionItems", async (request, response) => {
    let item = new AuctionItem(request.body)
    let result = await item.save()
    response.json(result)
  })

  //To get all auctionItems with all info
  server.get("/data/auctionItems", async (request, response) => {
    let result = await AuctionItem.find()
    response.json(result)
  })

  //To get one auctionItem with all info
  server.get("/data/auctionItems/:id", async (request, response) => {
    let result = await AuctionItem.findById(request.params.id)
    response.json(result)
  })

  //To get one auctionItem with info to be shown in detailed view.
  server.get(
    "/data/detailedViewAuctionItems/:auctionItemId",
    async (request, response) => {
      let bid = await Bid.where("auctionItem")
        .equals(request.params.auctionItemId)
        .select("buyers")
      let bidList = bid[bid.length - 1].buyers
      let currentBid = bidList[bidList.length - 1].bidAmount
      let numberOfBids = bidList.length
      let item = await AuctionItem.findById(request.params.auctionItemId)
        .select([
          "name",
          "startTime",
          "endTime",
          "startingPrice",
          "itemPicture",
          "description"
        ])
        .populate("seller", ["firstname", "lastname", "address.city"])
        .exec()
      response.json({ item, currentBid, numberOfBids })
    }
  )

  //To get all auctionItems summarized in a listview. TopBid and number of bids
  // not yet added to be shown.
  server.get("/data/listViewAuctionItems", async (request, response) => {
    let result = await AuctionItem.find()
      .select("itemPicture")
      .select("name")
      .select("endTime")

    response.json(result)
  })

  //To get auctionItems per category summarized in a listview. TopBid and number of bids
  // not yet added to be shown.
  server.get(
    "/data/listViewAuctionItems/:categoryId",
    async (request, response) => {
      let result = await AuctionItem.where("category")
        .equals(request.params.categoryId)
        .select("itemPicture")
        .select("name")
        .select("endTime")

      response.json(result)
    }
  )

  //To delete an auctionItem
  server.delete("/data/auctionItems/:id", async (request, response) => {
    await AuctionItem.findById(request.params.id).remove()
    response.json({ result: "Item deleted" })
  })

  //Search for auctionItems User Stories 3
  server.get(
    "/data/listview-auctionItems/:search",
    async (request, response) => {
      let result = await AuctionItem.find({
        name: { $regex: request.params.search, $options: "i" }
      })
      console.log(request.params.search)
      response.json(result)
    }
  )
}
