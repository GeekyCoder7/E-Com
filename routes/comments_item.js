var express = require("express");
var router  = express.Router({mergeParams: true});
var Item = require("../models/Item");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find Item by id
    Item.findById(req.params.id, function(err, Item){
        if(err){
            console.log(err);
        } else {
             res.render("comments_item/new", {Item: Item});
        }
    })
});
router.get("/discounts/new", middleware.isLoggedIn, function(req, res){
    // find Item by id
    Item.findById(req.params.id, function(err, Item){
        if(err){
            console.log(err);
        } else {
             res.render("discounts_item/new", {Item: Item});
        }
    })
});


//Comments Create
router.post("/",middleware.isLoggedIn,function(req, res){
    //lookup Item using ID
    Item.findById(req.params.id, function(err, item){
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
                comment.dateDMY= new Date();
                
                //save comment
                comment.save();
                item.comments.push(comment);
                item.save();
                
            Item.findOneAndUpdate({'_id': req.params.id},{ "$push": { "comments": comment} } , function(err, Item){
            console.log("Updated");
            });
                // req.flash("success", "Successfully added comment");
                res.redirect('/Items/' + item._id);
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
        res.render("comments_item/edit", {Item_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/Items/" + req.params.id );
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
           res.redirect("/Items/" + req.params.id);
       }
    });
});

module.exports = router;