const port = 3000,
    express = require("express"),
    app = express(),
    homeController = require("./controllers/homeController"),
    errorController = require("./controllers/errorController"),
    layouts = require("express-ejs-layouts");

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

//route to contact page
app.get("/contact", homeController.getContact);

//route to a function that responds with your name as a route parameter
//(just for practice)
app.get("/name/:myName", homeController.respondWithName);

//routes for the error catching functions (have to be below all the other routes)
app.use(errorController.respondNoResourceFound);
app.use(errorController.respondInternalError);

//connect to the port
app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${ app.get("port")}`);
});