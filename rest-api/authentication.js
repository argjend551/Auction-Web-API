module.exports = function (server, Customer) {
  // This post is to login
  server.post("/data/login", async (request, response) => {
    let result = await Customer.findOne({
      email: request.body.email,
      password: request.body.password,
    });
    if (result) {
      request.session.customer = result;
      response.json({ loggedIn: true });
    } else {
      delete request.session.customer;
      response.json({ loggedIn: false });
    }
  });

  // to check if your signed in, it will send you back your first and lastname.
  server.get("/data/login", async (request, response) => {
    if (request.session.customer) {
      let result = await Customer.findOne({
        email: request.session.customer.email,
        password: request.session.customer.password,
      });
      if (result) {
        response.json({
          firstname: request.session.customer.firstname,
          lastname: request.session.customer.lastname,
        });
      } else {
        response.json({ loggedIn: false });
      }
    } else {
      response.json({ loggedIn: false });
    }
  });

  // this delete is to log out
  server.delete("/data/login", async (request, response) => {
    let result = await Customer.findOne({
      email: request.body.email,
      password: request.body.password,
    });
    if (result) {
      delete request.session.customer;
      response.json({ loggedIn: false });
    } else {
      response.json("Wrong email or password");
    }
  });
};
