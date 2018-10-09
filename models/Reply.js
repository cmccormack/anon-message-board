const mongoose = require("mongoose")

const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: Date.now() },
  reported: { type: Boolean, default: false },
})

const Reply = mongoose.model("Reply", replySchema, "replies")

module.exports = Reply