require("dotenv").config()
const express = require("express")
const app = express()

app.use(express.json())

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the backend!" })
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port " + (process.env.PORT || 3000))
})