const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const passport= require("passport");
const User= require("./models/user.js");
const app = express();
const path=require("path");
const ejs=require("ejs")
const ejsMate = require('ejs-mate');
//views
app.set("view engine","ejs")
app.set("views" ,path.join(__dirname,"views") )
app.engine('ejs', ejsMate);
app.use(express.static(path.join((__dirname,"/public"))))
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
// Middleware setup
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



const mongoUrl = "mongodb://localhost:27017/tut_db3";

// Connect to MongoDB using then and catch for promise handling
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Connection error:', error);
});

// Configure express-session with connect-mongo
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));



app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.get('/login', (req, res, next) => {
    res.render("auth/login.ejs")
});


app.post('/login', passport.authenticate('local', {successRedirect: '/login-success',failureRedirect: '/login-failure' }), (err, req, res, next) => {
    if (err) next(err);
});

app.get('/register', (req, res, next) => {

   res.render("auth/register")
    
});


app.post("/register", async (req, res,) => {
        const newUser = new User({ username: req.body.username });
        await User.register(newUser, req.body.password);
        res.redirect("/login");

});

app.get('/login-success', (req, res, next) => {
    res.render("auth/loginSuc")
    
});

app.get('/login-failure', (req, res, next) => {
    res.render("auth/loginFai")
});

app.get('/protected-route', (req, res, next) => {
    
    // This is how you check if a user is authenticated and protect a route.  You could turn this into a custom middleware to make it less redundant
    if (req.isAuthenticated()) {

        res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
    } else {
        res.send('<h1>You are not authenticated</h1><p><a href="/login">Login</a></p>');
    }
});

app.listen(8000, () => {
    console.log("Listening on port 8000");
});
