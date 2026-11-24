const mongoose = require("mongoose");

async function connectMongo() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
}

module.exports = connectMongo;
