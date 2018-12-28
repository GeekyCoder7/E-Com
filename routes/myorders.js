var express = require("express");
var router  = express.Router({mergeParams: true});
var SoldItem = require("../models/SoldItem");
var Item = require("../models/Item");
var SoldService = require("../models/SoldService");
var Service = require("../models/Service");
var User = require("../models/user");
var middleware = require("../middleware");


router.get("/", middleware.isLoggedIn,function(req, res){// "/" localhost:1111/myorders
    var noMatch = null;
    //res.render("adminpanel"); 
    SoldItem.find({_to:req.user._id}, function(err, allSoldItems){
        if(err){
            console.log(err);
        } else {
            Item.find({_to:req.user._id}, function(err, allItems){
                Service.find({_to: req.user._id}, function(err, allServices){
                    SoldService.find({_to: req.user._id}, function(err, allSoldServices){
                        res.render("myorders",{SoldItems:allSoldItems, Items: allItems,Services: allServices, SoldServices:allSoldServices,noMatch: noMatch});
                    });
                 });
            });

        }
     });
 });

module.exports = router;