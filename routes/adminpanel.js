var express = require("express");
var router  = express.Router({mergeParams: true});
var middleware = require("../middleware");
var Item = require("../models/Item");
var Service = require("../models/Service");

router.get("/", middleware.isLoggedIn, function(req, res){// "/" localhost:1111/adminpanel
    var noMatch = null;
    Item.find({}, function(err, allItems){
        if(err){
            console.log(err);
        } else {
            Service.find({}, function(err, allServices){
                res.render("adminpanel",{Items:allItems, Services: allServices, noMatch: noMatch});
             });
           
        }
     });
 });



 module.exports = router;