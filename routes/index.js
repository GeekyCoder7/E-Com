var express = require("express");
var router  = express.Router();
var passport = require("passport");
var Item = require("../models/Item");
var Service = require("../models/Service");
var User = require("../models/user");
var lowerCase =require("lower-case");
//root route
router.get("/",  function(req, res){// "/" localhost:1111/
    var noMatch = null;
    Item.find({}, function(err, allItems){
        if(err){
            console.log(err);
        } else {
            Service.find({}, function(err, allServices){
                res.render("homepage",{Items:allItems, Services: allServices, noMatch: noMatch});
             });
           
        }
     });
 });

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
router.post("/register", function(req, res){
    req.body.username = lowerCase(req.body.username);
    var newUser = new User({
        username: req.body.username,
        phonenumber: req.body.phonenumber,
        address: req.body.address,
        isAdmin: false,
        position:{
            latitude: req.body.latitude,
            longitude: req.body.longitude
        },
        creditcard: {
            cardFName: req.body.cardFName,
            cardLName: req.body.cardLName,
            number: req.body.cardnumber,
            securityNumber: req.body.securitynumber,
            expDateM: req.body.expiryM,
            expDateY: req.body.expiryY
        }
        }
    );

    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
        //    req.flash("success", "Welcome to JNJ " + user.username);
           res.redirect("/Items"); 
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login"); 
});

//handling login logic
router.post('/login', function(req, res, next) {
    req.body.username = lowerCase(req.body.username);
  passport.authenticate('local', function(err, user, info) {

    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      if(user.isAdmin){
          console.log(user);
        var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/adminpanel';
        delete req.session.redirectTo;
        res.redirect(redirectTo);
      }
      else{
      var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/Items';
      delete req.session.redirectTo;
      res.redirect(redirectTo);
      }
    });
  })(req, res, next);
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
//    req.flash("success", "Logged you out!");
   res.redirect("/Items");
});



module.exports = router;