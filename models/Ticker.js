const mongoose = require("mongoose")

const tickerSchema = new mongoose.Schema({
  stock: { type: String, required: true },
  ip_addresses: [String],
  likes: { type: Number, default: 0},
  price: { type: Number, default: 0},
})

tickerSchema.methods.getPublicFields = function () {
  return {
    stock: this.stock,
    likes: this.likes,
    price: this.price
  }
}

const Ticker = mongoose.model("Ticker", tickerSchema, "tickers")

module.exports = Ticker