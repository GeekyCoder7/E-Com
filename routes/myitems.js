var express = require("express");
var router  = express.Router({mergeParams: true});
var SoldItem = require("../models/SoldItem");
var Item = require("../models/Item");
var Service = require("../models/Service");
var SoldService = require("../models/SoldService");
var User = require("../models/user");
var middleware = require("../middleware");


router.get("/", middleware.isLoggedIn,function(req, res){// "/" localhost:1111/myorders
    var noMatch = null;
    //res.render("adminpanel");
    
    SoldItem.find({"author.id": req.user._id}, function(err, allSoldItems){
        if(err){
            console.log(err);
        } else {
            Item.find({"author.id": req.user._id}, function(err, allItems){
                Service.find({"author.id": req.user._id}, function(err, allServices){
                    SoldService.find({"author.id": req.user._id}, function(err, allSoldServices){
                        res.render("myitems",{SoldItems:allSoldItems, Items: allItems,Services: allServices, SoldServices:allSoldServices,noMatch: noMatch});
                    });
                 });
            });
        }
     });
 });


module.exports = router;