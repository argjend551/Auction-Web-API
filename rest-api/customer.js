// Registration

module.exports = function (server, Customer) {
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

    response.json(result);
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
