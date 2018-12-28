var express = require("express");
var router  = express.Router({mergeParams: true});
var Service = require("../models/Service");
var SoldService = require("../models/SoldService");
var middleware = require("../middleware");
var fs = require('fs');

var multer = require('multer'),
    path = require('path');



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
  



//NEW - show form to create new Service
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("Services/new"); 
 });
 
 
//CREATE - add new Service to DB
router.post("/", upload.any(), middleware.isLoggedIn, function(req, res){
      

    // get data from form and add to Services array
    var name = req.body.name;
    var category = req.body.category;
    var desc = req.body.description;
    var price = req.body.price;
    var status = "";
    var address = req.body.address;
    var dateAdded = new Date();
    var isApproved = false;
    var isDisapproved = false;
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
    var newService = {name: name,  category:category ,description: desc,price: price,position:position,dateAdded:dateAdded,status:status, isApproved: isApproved,
        isDisapproved:isDisapproved, nameVisibility:nameVisibility,requestDate:requestDate,sessionExpired:sessionExpired, images:images,address: address,author:author}
    // Create a new Service and save to DB
    Service.create(newService, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to Services page
            console.log(newlyCreated);
           res.redirect("/Items");
        }
    });
});

router.get("/:id/payment",  middleware.isLoggedIn, function(req, res){
    var noMatch =null;
    Service.find({_id:req.params.id}, function(err, allServices){
        if(err){
            console.log(err);
        } else {
            var currentDate = new Date();
            var seconds = (currentDate.getTime() - allServices[0].requestDate) / 1000;
            if(seconds>21600){ //more than 6 hours, reset all as if no one requested the item
                //session expired
                console.log("Session expired");
                Service.findByIdAndUpdate({_id:req.params.id}, {$set: { requestDate: "",_to: "", isRequested: false,
                                             to: "",sessionExpired: true,requestAccepted:false,status:""}},function(err, allServices){
                });
            }

           res.render("Services/payment",{Services:allServices, noMatch: noMatch}); 
          
        }
     }); 
    
});

router.post("/:id/request_response", middleware.isLoggedIn,  function(req, res){
        

    if(req.body.response=="Accept request"){
     Service.findByIdAndUpdate(req.params.id,{$set: { requestAccepted: true}} ,function(err, Item){
         if(err){
             console.log(err);
         } else {

         res.redirect("/Services/"+req.params.id);
     }
  });
    }
    else  if(req.body.response=="Reject request"){
     Service.findByIdAndUpdate(req.params.id,{$set: { requestAccepted: false, isRequested:false, to: "",_to:""}} ,function(err, Item){
         if(err){
             console.log(err);
         } else {

         res.redirect("/Services/"+req.params.id);
         }
     });
    }  
 });

router.get("/:id/request",  middleware.isLoggedIn, function(req, res){
    var requestDate = new Date().getTime();
    Service.findByIdAndUpdate(req.params.id,{$set: { isRequested: true,requestDate:requestDate, to:req.user.username ,_to:req.user._id,sessionExpired:false}} ,function(err, Item){
       if(err){
           console.log(err);
       } else {

       res.redirect("/Services/"+req.params.id);
   }
    });
});
    
  
router.get("/:id/disapproved", middleware.isLoggedIn,  function(req, res){
    
        Service.findByIdAndUpdate(req.params.id,{$set: { isDisapproved: true} },function(err, Item){
            if(err){
                console.log(err);
            } else {
            res.redirect("/adminpanel");
        }
    });
});

router.post("/:id/payment", middleware.isLoggedIn,  function(req, res){
 
   Service.findByIdAndUpdate(req.params.id,{$set:{ to:req.user.username ,_to:req.user._id, status: "Sold"}}, function(err,service){
        if(err){
            res.redirect("/Items");
        } else {
           
            res.redirect("/Items");
        }
     });
});



router.post("/:id/servicestatus", middleware.isLoggedIn, function(req, res){
    if(req.body.status=="done"){
        Service.findById(req.params.id, function(err, Service){
            if(err){
                console.log(err);
            } else {
                 var name = Service.name;
                 var category = Service.category;
                 var status = Service.status;
                 var description = Service.description;
                 var nameVisibility = Service.nameVisibility;
                 var to = Service.to;
                 var _to = Service._to;
                 var price = Service.price;


                 var deliveryDate = new Date();
                 var author = {
                    id: Service.author.id,
                    username: Service.author.username,
                    phonenumber: Service.author.phonenumber,
                    address: Service.author.address
                    
                }

                 var newSoldService = {name: name,_to:_to,to:to, category:category ,description: description,price: price,
                    deliveryDate:deliveryDate, nameVisibility:nameVisibility,author:author,status:status};
                    // Create a new Item and save to DB
                    SoldService.create(newSoldService, function(err, newlyCreated){
                        if(err){
                            console.log(err);
                        }
                    });
    
            }
        });
        Service.findByIdAndRemove(req.params.id, function(err, foundItem){
            if(err){
                res.redirect("/adminpanel");
            } else {
                res.redirect("/adminpanel");
            }
        });
    }
   
});

router.delete("/:id",middleware.isLoggedIn, function(req, res){
    Service.findByIdAndRemove(req.params.id, function(err){
       if(err){
           console.log("Service not found \n"+req.params.id);
           res.redirect("/Items");
       } else {
           res.redirect("/Items");
       }
    });
 });

// SHOW - shows more info about one Service
router.get("/:id", function(req, res){
    //find the Service with provided ID
    Service.findById(req.params.id).populate("comments").exec(function(err, foundService){
        if(err){
            console.log(err);
        } else {
            //render show template with that Service
            res.render("Services/show", {Service: foundService});
        }
    });
});

router.get("/:id/approved",  middleware.isLoggedIn, function(req, res){
       
    Service.findByIdAndUpdate(req.params.id,{$set: { isApproved: true}} ,function(err, Item){
        if(err){
            console.log(err);
        } else {

        res.redirect("/adminpanel");
    }
 });
});

// EDIT Item ROUTE
router.get("/:id/edit", middleware.checkServiceOwnership, function(req, res){
    Service.findById(req.params.id, function(err, foundService){
        res.render("Services/edit", {Service: foundService});
    });
});

// UPDATE Item ROUTE
router.put("/:id",middleware.checkServiceOwnership, function(req, res){
    // find and update the correct Item
    Service.findByIdAndUpdate(req.params.id, req.body.Service, function(err, updatedService){
       if(err){
           res.redirect("/Items");
       } else {
           //redirect somewhere(show page)
           res.redirect("/Services/" + req.params.id);
       }
    });
});

// DESTROY Item ROUTE
router.delete("/:id",middleware.checkServiceOwnership, function(req, res){
   Service.findByIdAndRemove(req.params.id, function(err){
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

