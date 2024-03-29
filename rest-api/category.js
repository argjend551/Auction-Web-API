module.exports = function (server, Category) {
  //to add a category
  server.post("/data/categories", async (request, response) => {
    let category = new Category(request.body)
    let result = await category.save()
    response.json(result)
  })

  //To get all categories
  server.get("/data/categories", async (request, response) => {
    let result = await Category.find()
    response.json(result)
  })

  //To get one category
  server.get("/data/categories/:id", async (request, response) => {
    let result = await Category.findById(request.params.id)
    response.json(result)
  })

  //To delete a category
  server.delete("/data/categories/:id", async (request, response) => {
    await Category.findById(request.params.id).remove()
    response.json({ result: "Category deleted" })
  })
}
