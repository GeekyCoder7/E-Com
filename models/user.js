var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var findorCreate = require('mongoose-findorcreate');

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    phonenumber: String,
    address: String,
    isAdmin: Boolean,
    position:{
        latitude: String,
        longitude: String
    },
    creditcard: {
        cardFName: String,
        cardLName: String,
        number: String,
        securityNumber: String,
        expDateM: String,
        expDateY: String
    }
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findorCreate);

module.exports = mongoose.model("User", UserSchema);