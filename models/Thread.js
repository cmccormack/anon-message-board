const mongoose = require("mongoose")

const threadSchema = new mongoose.Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  replies: [],
  created_on: { type: Date, default: Date.now() },
  bumped_on: { type: Date, default: Date.now() },
  reported: { type: Boolean, default: false },
  board: { type: String },
})

const Thread = mongoose.model("Thread", threadSchema, "threads")

module.exports = Thread