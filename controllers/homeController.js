
//create route to home page and log requests body
exports.logRequestPaths = (req,res) => {
    console.log(req.body);
    console.log(req.query);
    res.send("POST Succesful!! ")
};

//render the index.ejs file (index page)
exports.getIndex = (req, res) => {
    res.render("index");
};

//render the name.ejs file with the route parameter as the name variable
exports.respondWithName = (req, res) => {
    let paramsName = req.params.myName;
    res.render("name", { name: paramsName});
};