const port = 3000,
    express = require("express"),
    app = express(),
    layouts = require("express-ejs-layouts"),
    path = require("path"),
    methodOverride = require("method-override"),
    router = express.Router();

const expressSession = require("express-session"),
    cookieParser = require("cookie-parser"),
    flash = require("connect-flash");

    
app.use(cookieParser("secret_passcode"));
//flash messages
app.use(expressSession({
    secret: "secret_passcode",  //obviously need to change that to something more secure
    cookie: {
        maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    next();
});

//set up mongoose & connection to db "rem_matching_test" locally.
//if db does not exist, mongoose will create db when first doc is inserted to db.
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/rem_matching_test", {useNewUrlParser: true, useFindAndModify: false });
const db = mongoose.connection;


db.once("open", () => {
    console.log("Successfully connected to MongoDB using Mongoose!");
});

//set the viewing engine to use ejs and the port
app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);

//tell express to parse URL-encoded data (request bodies)
app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(express.json());
app.use(layouts);

//defines the folder for static files (css f.e.)
app.use(express.static(path.join(__dirname, 'public')));
 

//all the routers:
app.use(require('./routes/errorRouter')); 
app.use(require('./routes/homeRouter'));
app.use(require('./routes/candidatesRouter'));
app.use(require('./routes/jobRouter'));
app.use(require('./routes/userRouter'));


//connect to the port
app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${ app.get("port")}`);
});

