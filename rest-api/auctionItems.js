const bid = require("./bid")

module.exports = function (server, AuctionItem, Bid) {
  //to add an auctionItem
  server.post("/data/auctionItems", async (request, response) => {
    // if (request.session.customer) {
    let item = new AuctionItem(request.body)
    let result = await item.save()
    response.json(result)
    // } else {
    //   return response.json("Not logged in");
    // }
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
        ;(currentBid = 0), (numberOfBids = 0)
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
    // if (request.session.customer) {
    await AuctionItem.findById(request.params.id).remove()
    response.json({ result: "Item deleted" })
    // } else {
    //   return response.json("Not logged in");
    // }
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
  //Filter auctionItems on status: active, ended, sold and unsold
  server.get("/data/auctionItem/:status", async (request, response) => {
    let auctions
    let nowTime = new Date()

    if (request.params.status === "active") {
      auctions = await AuctionItem.find({ status: true })
        .select("itemPicture")
        .select("name")
        .select("endTime")
    } else if (request.params.status === "ended") {
      auctions = await AuctionItem.find({
        status: false,
        startTime: { $lt: nowTime }
      })
        .select("itemPicture")
        .select("name")
        .select("endTime")
    } else if (request.params.status === "sold") {
      auctions = await AuctionItem.find({
        status: false,
        startTime: { $lt: nowTime },
        bidWinOffer: { $ne: 0 }
      })
        .where("bidWinOffer > reservationPrice")
        .select("itemPicture")
        .select("name")
        .select("endTime")
        .select("bidWinOffer")
    } else if (request.params.status === "unsold") {
      auctions = await AuctionItem.find({
        status: false,
        startTime: { $lt: nowTime },
        bidWinOffer: { $eq: 0 }
      })
        .where("bidWinOffer < reservationPrice")
        .select("itemPicture")
        .select("name")
        .select("endTime")
    }
    response.json(auctions)
  })

  //Update all entries status.
  server.put("/data/auctionItems", async (request, response) => {
    let result = await AuctionItem.find()
    let allBids = await Bid.find()

    let index = -1

    for (const element of result) {
      index += 1

      const dateA = new Date(result[index].startTime)
      const dateB = new Date(result[index].endTime)

      // For todays date. / since I failed to
      // propertly create a debugDate in ISO format.
      const dateC = new Date()

      let isDateCBetweenAandB =
        dateC.getTime() >= dateA.getTime() && dateC.getTime() <= dateB.getTime()

      // When auction is done

      let bidWinner = null
      let highestOffer = 0

      // Not as safe as I want , I wanted to trigger state on off - but since we
      // we can only put in bids when in status = true - there shouldent be any problem
      // re evaluating the the bid winner.
      //
      // We should have a better name then status :/
      // better name like isActionActive instead of status.
      if (!isDateCBetweenAandB) {
        if (allBids[index] != null) {
          let bidOnAuction = allBids[index].buyers

          if (bidOnAuction != null) {
            let heighestBidValue = 0

            for (const bidOffer of bidOnAuction) {
              let bidAmount = bidOffer.bidAmount

              // find highest bid.
              if (
                bidAmount > heighestBidValue &&
                bidAmount > element.startingPrice &&
                bidAmount > element.reservationPrice
              ) {
                bidWinner = bidOffer
                highestOffer = heighestBidValue = bidAmount
              }
            }
          }
        }
      }

      // Finalize save object
      // Write to object. / skall vara ID inte name.
      // It just dont work correctly when I've tried other things :/
      const filter = { name: result[index].name }
      const update = {
        status: isDateCBetweenAandB,
        bidWinner: bidWinner,
        bidWinOffer: highestOffer
      }

      let doc = await AuctionItem.findOneAndUpdate(filter, update, {
        new: true
      })
    }

    response.end()
  })
}
