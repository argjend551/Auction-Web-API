const bid = require("./bid")

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
      let bidList, currentBid, numberOfBids
      if (bid[0] === undefined) {
        ; (currentBid = 0), (numberOfBids = 0)
      } else {
        bidList = bid[bid.length - 1].buyers
        currentBid = bidList[bidList.length - 1].bidAmount
        numberOfBids = bidList.length
      }
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

  //To get all auctionItems summarized in a listview.
  server.get("/data/listViewAuctionItems", async (request, response) => {
    let nowTime = new Date()
    let bids = await Bid.find()
    let auctionItems = await AuctionItem.find()
      .where({ endTime: { $gt: nowTime }, startTime: { $lt: nowTime } })
      .sort("endTime")
      .limit(20)
      .select("itemPicture")
      .select("name")
      .select("endTime")
    let result = []
    let currentBid, numberOfBids, bid, item, timeLeft, auctionTimeLeft
    let bidExists
    for (let i = 0; i < auctionItems.length; i++) {
      item = auctionItems[i]
      timeLeft = item.endTime.getTime() - nowTime.getTime()
      let days = Math.floor(timeLeft / (24 * 60 * 60 * 1000))
      let hours = Math.floor(
        (timeLeft - days * (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
      )
      let minutes = Math.floor(
        (timeLeft - (days * (24 * 60 * 60 * 1000) + hours * (60 * 60 * 1000))) /
        (60 * 1000)
      )
      auctionTimeLeft =
        days + " dagar, " + hours + " timmar, " + minutes + " minuter kvar"
      bidExists = false
      for (let j = 0; j < bids.length; j++) {
        bid = bids[j]
        if (String(bid.auctionItem) === String(item._id)) {
          bidExists = true
          currentBid = bid.buyers[bid.buyers.length - 1].bidAmount
          numberOfBids = bid.buyers.length
          result.push({ item, currentBid, numberOfBids, auctionTimeLeft })
        }
      }
      if (!bidExists) {
        currentBid = 0
        numberOfBids = 0
        result.push({ item, currentBid, numberOfBids, auctionTimeLeft })
      }
    }
    response.json(result)
  })

  //To get auctionItems per category summarized in a listview.
  server.get(
    "/data/listViewAuctionItems/:categoryId",
    async (request, response) => {
      let nowTime = new Date()
      let bids = await Bid.find()
      let auctionItems = await AuctionItem.where("category")
        .equals(request.params.categoryId)
        .where({ endTime: { $gt: nowTime }, startTime: { $lt: nowTime } })
        .select("itemPicture")
        .select("name")
        .select("endTime")
      let result = []
      let currentBid, numberOfBids, bid, item
      let bidExists
      for (let i = 0; i < auctionItems.length; i++) {
        item = auctionItems[i]
        bidExists = false
        for (let j = 0; j < bids.length; j++) {
          bid = bids[j]
          if (String(bid.auctionItem) === String(item._id)) {
            bidExists = true
            currentBid = bid.buyers[bid.buyers.length - 1].bidAmount
            numberOfBids = bid.buyers.length
            result.push({ item, currentBid, numberOfBids })
          }
        }
        if (!bidExists) {
          currentBid = 0
          numberOfBids = 0
          result.push({ item, currentBid, numberOfBids })
        }
      }

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
        .select("name")
        .select("endTime")
        .select("startingPrice")
        .select("itemPicture")
        .select("description")
      response.json(result)
    }
  )
  //Search auctionItem in a catagories for User Stories 15
  server.get(
    "/data/listViewAuctionItems/:categoryID/:search",
    async (request, response) => {
      let result = await AuctionItem.find({
        category: request.params.categoryID
      })
        .find({
          name: { $regex: request.params.search, $options: "i" }
        })
        .select("name")
        .select("endTime")
        .select("startingPrice")
        .select("itemPicture")
        .select("description")
      response.json(result)
    }
  )

  //Update all entries status.
  server.put("/data/auctionItems", async (request, response) => {
    let result = await AuctionItem.find();
    let allBids = await Bid.find();

    let index = -1

    result.forEach((element) => {
      index += 1
      const dateA = new Date(element.startTime)
      const dateB = new Date(element.endTime)

      // For debugging purposes this is currently changable like this
      // but in live version it will be set by current time of date.
      const checkDateRange = new Date("2022-03-20T11:00:00.000Z")

      const isDateCBetweenAandB =
        dateA.getTime() <= checkDateRange.getTime() &&
        checkDateRange.getTime() <= dateB.getTime()

      let newAuctionState = element.status;
      // Update the state
      element.status = isDateCBetweenAandB

      // current winner of auction
      let bidWinner = null;
      // When auction is done 
      if (true) {

        if (allBids[index] != null) {

          let bidOnAuction = allBids[index].buyers;

          if (bidOnAuction != null) {

            let highestBid = 0;

            bidOnAuction.forEach(bidOffer => {

              let bidAmount = bidOffer.bidAmount;

              // find highest bid.
              if (bidAmount > highestBid && bidAmount > element.reservationPrice) {
                bidWinner = bidOffer;
                highestBid = bidWinner.bidAmount;

                element.bidWinner = bidOffer;
                element.bidWinAmmount = highestBid;
              }
            });
          }
        }
      }
    })

    response.json(result)
  })
}
