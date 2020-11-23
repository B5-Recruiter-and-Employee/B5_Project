const port = 3000,
    express = require("express"),
    app = express(),
    homeController = require("./controllers/homeController"),
    errorController = require("./controllers/errorController"),
    candidatesController = require("./controllers/candidatesController"),
    jobController = require("./controllers/jobController"),
    layouts = require("express-ejs-layouts");

//set up mongoose & connection to db "rem_matching_test" locally.
//if db does not exist, mongoose will create db when first doc is inserted to db.
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/rem_matching_test", {useNewUrlParser: true});

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

//create route to home page and log requests body
//(send data with a curl command, just for practice)
app.post("/", homeController.logRequestPaths);

//route to index page
app.get("/", homeController.getIndex);

//route to a function that responds with your name as a route parameter
//(just for practice)
app.get("/name/:myName", homeController.respondWithName);

//the overview of all candidates
app.get("/candidates", candidatesController.getAllCandidates);
//when contact form is submitted, the candidate is added to db
app.get("/contact", candidatesController.getSubscriptionPage);
app.post("/subscribe", candidatesController.saveCandidate);

//overview of job offers
app.get("/jobs", jobController.getAllJobs);
app.get("/jobs/new", jobController.createJobs); // create jobs
app.post("/jobs/create", jobController.saveJob);

//routes for the error catching functions (have to be below all the other routes)
app.use(errorController.respondNoResourceFound);
app.use(errorController.respondInternalError);

//connect to the port
app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${ app.get("port")}`);
});