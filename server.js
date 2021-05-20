const express = require("express")

const server = express()

// makes a route at the root domain and reponds to all http requests
server.all("/", (req, res) => {
  res.send("Bot is running!")
})

function keepAlive() {
  server.listen(3000, () => {
    console.log("Server is ready.")
  })
}

module.exports = keepAlive