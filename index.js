require('./db.js')
const authRoute = require("./routes/auth");
const postRoute = require("./routes/blog");
const express = require('express')
const app = express()


app.use(express.json());
app.use("/api/posts", postRoute);
app.use("/api/auth", authRoute);


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})