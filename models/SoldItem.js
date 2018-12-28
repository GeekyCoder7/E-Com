var mongoose = require("mongoose");

var SoldItemschema = new mongoose.Schema({
   name: String,
   _to: String,
   to: String,
   category: String,
   description: String,
   price: Number,
   deliveryStatus: String,
   deliveryCost: Number,
   deliveryDate: String,
   nameVisibility: Boolean,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String,
      phonenumber: String,
      address: String
   }
});

module.exports = mongoose.model("SoldItem", SoldItemschema);