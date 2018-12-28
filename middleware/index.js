var Item = require("../models/Item");
var Service = require("../models/Service");
var Comment = require("../models/comment");
// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkItemOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Item.findById(req.params.id, function(err, foundItem){
           if(err){
               req.flash("error", "Item not found");
               res.redirect("back");
           }  else {
               // does user own the Item?
            if(foundItem.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}
middlewareObj.checkServiceOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
           Service.findById(req.params.id, function(err, foundService){
              if(err){
                  req.flash("error", "Item not found");
                  res.redirect("back");
              }  else {
                  // does user own the Item?
               if(foundService.author.id.equals(req.user._id)) {
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that");
                   res.redirect("back");
               }
              }
           });
       } else {
           req.flash("error", "You need to be logged in to do that");
           res.redirect("back");
       }
   }

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}




middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    
    req.session.redirectTo = req.originalUrl;
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;