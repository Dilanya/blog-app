require('dotenv').config(); 
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const mongoDB = process.env.DB_CONNECTION; 

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
  console.log("Connected to MongoDB");
}
