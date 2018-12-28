var mongoose = require("mongoose");

var Itemschema = new mongoose.Schema({
   name: String,
   category: String,
   description: String,
   price: Number,
   position:{
      latitude: String,
      longitude: String
   },
   dateAdded: String,
   isApproved: Boolean,
   isDisapproved: Boolean,
   deliveryStatus: String,
   deliveryCost: Number,
   nameVisibility: Boolean,
   isRequested: Boolean,
   requestAccepted: Boolean,
   requestDate: String,
   sessionExpired: Boolean,
   date: String,
   _to: String,
   to:String,
   
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String,
      phonenumber: String,
      address: String
   },
   images:{
      image1:String,
      image2:String,
      image3:String,
      image4:String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Item", Itemschema);