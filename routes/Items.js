var express = require("express");
var router  = express.Router({mergeParams: true});
var Item = require("../models/Item");
var SoldItem = require("../models/SoldItem");
var Service = require("../models/Service");
var middleware = require("../middleware");
var passport = require('passport');
var multer = require('multer'),
    path = require('path'),
    FacebookStrategy = require('passport-facebook').Strategy;

var upload = multer({storage: multer.diskStorage({

    destination: function (req, file, callback) 
    { callback(null, './uploads/');},
    filename: function (req, file, callback) 
    { callback(null, file.fieldname +'-' + Date.now()+file.originalname);}
  
  }),
  
  fileFilter: function(req, file, callback) {
    var ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(/*res.end('Only images are allowed')*/ null, false)
    }
    callback(null, true)
  }
  });
  


//INDEX - show all Items
    router.get("/:id/payment",middleware.isLoggedIn, function(req, res){
       
        var noMatch =null;
       
        Item.find({_id:req.params.id}, function(err, allItems){
            if(err){
                console.log(err);
            } else {
                var currentDate = new Date();
                var seconds = (currentDate.getTime() - allItems[0].requestDate) / 1000;
                if(seconds>21600){ //more than 6 hours, reset all as if no one requested the item
                    //session expired
                    console.log("Session expired");
                    Item.findByIdAndUpdate({_id:req.params.id}, {$set: { requestDate: "",_to: "", isRequested: false, to: "",sessionExpired: true,requestAccepted:false}},function(err, allItems){
                    });
                }

               res.render("Items/payment",{Items:allItems, noMatch: noMatch}); 
              
            }
         }); 
        
    });

    router.get("/:id/nodelivery",middleware.isLoggedIn, function(req, res){
        var noMatch =null;
        Item.findByIdAndUpdate(req.params.id,{$set: { deliveryStatus: "User to pick up item",deliveryCost: 0}} ,function(err, Item){
            if(err){
                console.log(err);
            } else {
            res.redirect("/Items/"+req.params.id);
        }
    });
        
    });

    router.post("/:id/request_response",middleware.isLoggedIn, function(req, res){
        

       if(req.body.response=="Accept request"){
        Item.findByIdAndUpdate(req.params.id,{$set: { requestAccepted: true}} ,function(err, Item){
            if(err){
                console.log(err);
            } else {

            res.redirect("/Items/"+req.params.id);
        }
     });
       }
       else  if(req.body.response=="Reject request"){
        Item.findByIdAndUpdate(req.params.id,{$set: { requestAccepted: false, isRequested:false, to: "",_to:""}} ,function(err, Item){
            if(err){
                console.log(err);
            } else {

            res.redirect("/Items/"+req.params.id);
            }
        });
       }  
    });

    router.get("/:id/request",middleware.isLoggedIn, function(req, res){
         var requestDate = new Date().getTime();
         Item.findByIdAndUpdate(req.params.id,{$set: { isRequested: true,requestDate:requestDate, to:req.user.username ,_to:req.user._id,sessionExpired:false}} ,function(err, Item){
            if(err){
                console.log(err);
            } else {

            res.redirect("/Items/"+req.params.id);
        }
         });
    });
    
    router.get("/:id/approved",middleware.isLoggedIn, function(req, res){
       
        Item.findByIdAndUpdate(req.params.id,{$set: { isApproved: true}} ,function(err, Item){
            if(err){
                console.log(err);
            } else {

            res.redirect("/adminpanel");
        }
     });
});
    
router.get("/:id/disapproved",middleware.isLoggedIn, function(req, res){
    Item.findByIdAndUpdate(req.params.id,{$set: { isDisapproved: true} },function(err, Item){
        if(err){
            console.log(err);
        } else {
        res.redirect("/adminpanel");
    }
});
       
 
});

router.post("/:id/payment",middleware.isLoggedIn, function(req, res){
 
   Item.findByIdAndUpdate(req.params.id,{$set:{ deliveryStatus: "Delivery in progress" , to:req.user.username ,_to:req.user._id }}, function(err){
        if(err){
            res.redirect("/Items");
        } else {
            res.redirect("/Items");
        }
     });
});


passport.use(new FacebookStrategy({
    clientID: "300214527288388",
    clientSecret: "836699b07371e2f319a8bbd2a5fce665",
    callbackURL: "http://localhost:1111/auth/facebook/callback",
    passReqToCallback : true,
    profileFields: ['emails'] // email should be in the scope.
  },
  function(accessToken, refreshToken, profile, done) {
     
    User.findOrCreate({}, function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));


router.get("/priceU", function(req, res){
    var noMatch = null;
        Item.find({$and: [{isApproved: true}, {isDisapproved: false},
            {$or:[ {deliveryStatus: "Not Delivered"}, {deliveryStatus: "Delivery in progress"}]}]})
            .sort({price: 1}).exec(function(err, allItems) {      
                Service.find({$and: [{isApproved: true}, {isDisapproved: false}]}).sort({price: 1}).exec(function(err, allServices){
                    res.render("Items/index",{Items:allItems,Services:allServices, noMatch: noMatch});
                });
         });
});


router.get("/priceD", function(req, res){
    var noMatch = null;
        Item.find({$and: [{isApproved: true}, {isDisapproved: false},
            {$or:[ {deliveryStatus: "Not Delivered"}, {deliveryStatus: "Delivery in progress"}]}]})
            .sort({price: -1}).exec(function(err, allItems) {      
                Service.find({$and: [{isApproved: true}, {isDisapproved: false}]}).sort({price: -1}).exec(function(err, allServices){
                    res.render("Items/index",{Items:allItems,Services:allServices, noMatch: noMatch});
                });
         });
});

router.get("/dateU", function(req, res){
    var noMatch = null;
        Item.find({$and: [{isApproved: true}, {isDisapproved: false},
            {$or:[ {deliveryStatus: "Not Delivered"}, {deliveryStatus: "Delivery in progress"}]}]})
            .sort({dateAdded: 1}).exec(function(err, allItems) {      
                Service.find({$and: [{isApproved: true}, {isDisapproved: false}]}).sort({dateAdded: 1}).exec(function(err, allServices){
                    res.render("Items/index",{Items:allItems,Services:allServices, noMatch: noMatch});
                });
         });
});


router.get("/dateD", function(req, res){
    var noMatch = null;
        Item.find({$and: [{isApproved: true}, {isDisapproved: false},
            {$or:[ {deliveryStatus: "Not Delivered"}, {deliveryStatus: "Delivery in progress"}]}]})
            .sort({dateAdded: -1}).exec(function(err, allItems) {      
                Service.find({$and: [{isApproved: true}, {isDisapproved: false}]}).sort({dateAdded: -1}).exec(function(err, allServices){
                    res.render("Items/index",{Items:allItems,Services:allServices, noMatch: noMatch});
                });
         });
});

/*
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
    }
  
  function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    var earthRadiusKm = 6371;
  
    var dLat = degreesToRadians(lat2-lat1);
    var dLon = degreesToRadians(lon2-lon1);
  
    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);
  
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return earthRadiusKm * c;
  }

router.get("/locU", function(req, res){
    var noMatch = null;
    if(req.user){

    var userLatitude = req.user.position.latitude;
    var userLongitude = req.user.position.longitude;
    var itemLatitude = 0;
    var itemLongitude = 0;
    
        Item.find({$and: [{isApproved: true}, {isDisapproved: false},
            {$or:[ {deliveryStatus: "Not Delivered"}, {deliveryStatus: "Delivery in progress"}]}]})
            .sort({dateAdded: 1}).exec(function(err, allItems) {      
                Service.find({$and: [{isApproved: true}, {isDisapproved: false}]}).sort({dateAdded: 1}).exec(function(err, allServices){
                    res.render("Items/index",{Items:allItems,Services:allServices, noMatch: noMatch});
                });
         });
    }
});


router.get("/locD", function(req, res){
    var noMatch = null;
        Item.find({$and: [{isApproved: true}, {isDisapproved: false},
            {$or:[ {deliveryStatus: "Not Delivered"}, {deliveryStatus: "Delivery in progress"}]}]})
            .sort({dateAdded: -1}).exec(function(err, allItems) {      
                Service.find({$and: [{isApproved: true}, {isDisapproved: false}]}).sort({dateAdded: -1}).exec(function(err, allServices){
                    res.render("Items/index",{Items:allItems,Services:allServices, noMatch: noMatch});
                });
         });
});*/


router.get("/", function(req, res){
    var noMatch = null;
     if(req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            // Get all Items and Services from DB
            Item.find({ $or:[ {name: regex}, {category:regex}]}, function(err, allItems){
            if(err){
                console.log(err);
            } else {
                
                Service.find({ $or:[ {name: regex}, {category:regex}]}, function(err, allServices){
                    if(allItems.length < 1 && allServices.length <1) {
                        noMatch = "No Item with name/category " + req.query.search + " found";
                    }
                    res.render("Items/index",{Items:allItems,Services:allServices, noMatch: noMatch});
                });
            }
            });
        } else {
        // Get all Items and Services from DB that are approved by the admin
       
        Item.find({$and: [{isApproved: true}, {isDisapproved: false} ,{$or:[ {deliveryStatus: "Not Delivered"}, {deliveryStatus: "Delivery in progress"}]}]}, function(err, allItems){
           if(err){
               console.log(err);
           } else {
            Service.find({$and: [{isApproved: true}, {isDisapproved: false} ]}, function(err, allServices){
                res.render("Items/index",{Items:allItems,Services:allServices, noMatch: noMatch});
             });
           }
        });
    }
});



router.delete("/:id",middleware.isLoggedIn, function(req, res){
    Item.findByIdAndRemove(req.params.id, function(err){
       if(err){
           console.log("Item not found \n"+req.params.id);
           res.redirect("/Items");
       } else {
           res.redirect("/Items");
       }
    });
 });

//CREATE - add new Item to DB
router.post("/", upload.any(), middleware.isLoggedIn, function(req, res){
    console.log("req.body");
console.log(req.body);

if(!req.body && !req.files){
    res.json({success: false});
  } else{
    // get data from form and add to Items array
    var name = req.body.name;
    var desc = req.body.description;
    var category = req.body.category;
    var address = req.body.address;
    var price = req.body.price;
    var dateAdded = new Date();
    var isApproved = false;
    var isDisapproved = false;
    var deliveryStatus = "Not Delivered";
    var deliveryCost = req.body.deliveryCost;
    var nameVisibility = req.body.nameVisibility;
    var requestDate = "";
    var sessionExpired = false;
    var imageJNJ = "blank.jpg";
   
    var images = {
        image1:req.files[0].filename,
        image2: imageJNJ,
        image3: imageJNJ,
        image4: imageJNJ
    } 
    if(typeof req.files[1] !== "undefined"){
        images.image2 = req.files[1].filename;  
    }

    if(typeof req.files[2] !== "undefined"){
        images.image3 = req.files[2].filename;  
    }

    if(typeof req.files[3] !== "undefined"){
        images.image4 = req.files[3].filename;  
    }
    
    var position = {
        latitude: req.user.position.latitude,
        longitude: req.user.position.longitude
    }
    

    var author = {
        id: req.user._id,
        username: req.user.username,
        phonenumber: req.user.phonenumber,
        address: req.body.address      
    }
    var newItem = {name: name, category:category ,description: desc,price: price,position:position, dateAdded:dateAdded,isApproved: isApproved,isDisapproved:isDisapproved,deliveryStatus:deliveryStatus,deliveryCost:deliveryCost,
        nameVisibility:nameVisibility,requestDate:requestDate,sessionExpired:sessionExpired,images:images, address: address,author:author}
    // Create a new Item and save to DB
    Item.create(newItem, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to Items page
            console.log(newlyCreated);
           res.redirect("/Items");
        }
    });
    }
});

//NEW - show form to create new Item
router.get("/new", middleware.isLoggedIn, function(req, res){
    console.log(req);
   res.render("Items/new"); 
});



// SHOW - shows more info about one Item
router.get("/:id", function(req, res){
    //find the Item with provided ID
    Item.findById(req.params.id).populate("comments").exec(function(err, foundItem){
        if(err){
            console.log(err);
        } else {
            //render show template with that Item
            res.render("Items/show", {Item: foundItem});
        }
    });
});

// EDIT Item ROUTE
router.get("/:id/edit", middleware.checkItemOwnership, function(req, res){
    Item.findById(req.params.id, function(err, foundItem){
        res.render("Items/edit", {Item: foundItem});
    });
});


router.post("/:id/deliverystatus", middleware.isLoggedIn, function(req, res){
    if(req.body.status=="Delivered"){
        Item.findById(req.params.id, function(err, Item){
            if(err){
                console.log(err);
            } else {
                 var name = Item.name;
                 var category = Item.category;
                 var description = Item.description;
                 var deliveryStatus = req.body.status;
                 var deliveryCost = Item.deliveryCost;
                 var nameVisibility = Item.nameVisibility;
                 var to = Item.to;
                 var _to = Item._to;
                 var price = Item.price;

                 var deliveryDate = new Date();
                 var author = {
                    id: Item.author.id,
                    username: Item.author.username,
                    phonenumber: Item.author.phonenumber,
                    address: Item.author.address
                    
                }

                 var newSoldItem = {name: name,_to:_to,to:to, category:category ,description: description,price: price,
                                    deliveryStatus:deliveryStatus,deliveryCost:deliveryCost,deliveryDate:deliveryDate,nameVisibility:nameVisibility,author:author};
                    // Create a new Item and save to DB
                    SoldItem.create(newSoldItem, function(err, newlyCreated){
                        if(err){
                            console.log(err);
                        }
                    });
    
            }
        });
        Item.findByIdAndRemove(req.params.id, function(err, foundItem){
            if(err){
                res.redirect("/adminpanel");
            } else {
                res.redirect("/adminpanel");
            }
        });
    }
   
});

// UPDATE Item ROUTE
router.put("/:id",middleware.checkItemOwnership, function(req, res){
    // find and update the correct Item
    Item.findByIdAndUpdate(req.params.id, req.body.Item, function(err, updatedItem){
       if(err){
           res.redirect("/Items");
       } else {
           //redirect somewhere(show page)
           res.redirect("/Items/" + req.params.id);
       }
    });
});

// DESTROY Item ROUTE
router.delete("/:id",middleware.checkItemOwnership, function(req, res){
   Item.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/Items");
      } else {
          res.redirect("/Items");
      }
   });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;

