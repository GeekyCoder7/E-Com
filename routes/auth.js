
var express = require("express");
var router  = express.Router({mergeParams: true});
var passport = require('passport');


router.get('/facebook', passport.authenticate('facebook',{ scope : 'public_profile,email,user_friends' }));
// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/Items', failureRedirect: '/login' }));


module.exports = router;
