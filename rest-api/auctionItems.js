module.exports = function (server, AuctionItem) {
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

  //To get all auctionItems summarized in a listview. TopBid and number of bids
  // can't be shown yet, no collection for bid.
  server.get("/data/listview-auctionItems", async (request, response) => {
    let result = await AuctionItem.find()
      .select("itemPicture")
      .select("name")
      .select("endTime")
    response.json(result)
  })

  //To delete an auctionItem
  server.delete("/data/auctionItems/:id", async (request, response) => {
    await AuctionItem.findById(request.params.id).remove()
    response.json({ result: "Item deleted" })
  })
}
