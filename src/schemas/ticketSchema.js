const { Schema, model } = require("mongoose");

let ticketSchema = new Schema({
  Guild: String,
  Category: String,
});

module.exports = model("ticketSchema101", ticketSchema);
