const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/* Creating a new schema for the invoice model. */
const invoiceSchema = new Schema({
  userID: { // This is userID of the shopkeeper
    type: String,
    required: true,
  },
  invoiceID: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: false,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    required: false,
  },
  paymentMode: {
    type: String,
    required: true,
  },
  itemList: {
    type: [ { itemID: String, itemName: String, quantity: Number, rate: Number, discount: Number, amount: Number } ],
    required: true,
  },
  createdAt:{
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model("Invoice", invoiceSchema);