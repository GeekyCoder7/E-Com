var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User        = require("./models/user"),
    path = require('path'),
    FacebookStrategy = require('passport-facebook').Strategy,
    favicon = require('serve-favicon');

//requiring routes
var commentItemRoutes    = require("./routes/comments_item"),
    commentServiceRoutes  = require("./routes/comments_service"),
    ItemRoutes = require("./routes/Items"),
    ServiceRoutes = require("./routes/Services"),
    AdminRoutes = require("./routes/adminpanel"),
    MyOrdersRoutes = require("./routes/myorders"),
    MyItemsRoutes = require("./routes/myitems"),
    authRoutes = require("./routes/auth"),
    HomePageRoutes = require("./routes/homepage"),
    ProfileRoutes = require("./routes/profile"),
    indexRoutes      = require("./routes/index");
    
mongoose.connect("mongodb://localhost/JNJ");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(express.static('uploads'));

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});


app.use("/", indexRoutes);
app.use("/Items", ItemRoutes);
app.use("/homepage", HomePageRoutes);
app.use("/Services", ServiceRoutes);
app.use("/myorders", MyOrdersRoutes);
app.use("/auth",authRoutes);
app.use("/myitems", MyItemsRoutes);
app.use("/adminpanel", AdminRoutes);
app.use("/profile", ProfileRoutes);AdminRoutes
app.use("/Items/:id/comments", commentItemRoutes);
app.use("/Services/:id/comments", commentServiceRoutes);

app.listen(1111, function(){
   console.log("The JNJ Server is running on port 1111!");
});


/*
passport.use(new FacebookStrategy({
    clientID: "300214527288388",
    clientSecret: "836699b07371e2f319a8bbd2a5fce665",
    callbackURL: "http://localhost:1111/auth/facebook/callback",
    profileFields: ['id','email','displayName'] // email should be in the scope.
  },
  
   function(accessToken, refreshToken, profile,done) {
      User.findOrCreate({ facebookId: profile.id }, function (err, user) {
         if(err){
         User.register(user, function(err, user){
            if(err){
                req.flash("error", err.message);
                return res.render("register");
            }
            passport.authenticate("local")(req, res, function(){
               req.flash("success", "Welcome to JNJ " + user.username);
               res.redirect("/Items"); 
            });
         });
      }
      });
  }
));
*/