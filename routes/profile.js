var express = require("express");
var router  = express.Router({mergeParams: true});

var User = require("../models/user");
var middleware = require("../middleware");


router.get("/", middleware.isLoggedIn, function(req, res){// "/" localhost:1111/profile
    res.render("profile"); 
 });


// UPDATE Item ROUTE
router.put("/:id",middleware.isLoggedIn, function(req, res){
   User.findByIdAndUpdate(req.params.id, req.body.User, function(err, updatedItem){
   res.redirect("/Items");
    });
});



module.exports = router;