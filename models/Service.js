var mongoose = require("mongoose");

var Serviceschema = new mongoose.Schema({
   name: String,
   category: String,
   description: String,
   price: Number,
   position:{
      latitude: String,
      longitude: String
   },
   dateAdded: String,
   status: String,
   isApproved: Boolean,
   isDisapproved: Boolean,
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

module.exports = mongoose.model("Service", Serviceschema);