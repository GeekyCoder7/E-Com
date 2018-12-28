var express = require("express");
var router  = express.Router({mergeParams: true});
var Service = require("../models/Service");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find Service by id
    Service.findById(req.params.id, function(err, Service){
        if(err){
            console.log(err);
        } else {
             res.render("comments_service/new", {Service: Service});
        }
    })
});
router.get("/discounts/new", middleware.isLoggedIn, function(req, res){
    // find Service by id
    Service.findById(req.params.id, function(err, Service){
        if(err){
            console.log(err);
        } else {
             res.render("discounts_service/new", {Service: Service});
        }
    })
});


//Comments Create
router.post("/",middleware.isLoggedIn,function(req, res){
    //lookup Service using ID
    Service.findById(req.params.id, function(err, service){
        if(err){
            console.log(err);
            res.redirect("/Items");
        } else {
         Comment.create(req.body.comment, function(err, comment){
            if(err){
                req.flash("error", "Something went wrong");
                console.log(err);
            } else {
                //add username and id to comment
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                comment.dateDMY = new Date();

                
                //save comment
                comment.save();
                service.comments.push(comment);
                service.save();
                
            Service.findOneAndUpdate({'_id': req.params.id},{ "$push": { "comments": comment} } , function(err, Service){
            console.log("Updated");
            });
                // req.flash("success", "Successfully added comment");
                res.redirect('/Services/' + service._id);
            }
         });
        }
    });

 });
 
// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("comments_service/edit", {Service_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/Services/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
        //    req.flash("success", "Comment deleted");
           res.redirect("/Services/" + req.params.id);
       }
    });
});

module.exports = router;