const httpStatus = require("http-status-codes");

//catch requests made with no matching routes
exports.respondNotFound = (req, res) => {
    let errorCode = httpStatus.StatusCodes.NOT_FOUND;
    res.status(errorCode);
    res.send(`${errorCode} | The page doesn't exist! `);
};

//catch requests where internal errors occurred
exports.respondInternalError = (req, res, next) => {
    let errorCode = httpStatus.StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(errorCode);
    res.send(`${errorCode} | Sorry, our application is experiencing a problem!`);
};

exports.respondAccessDenied = (req, res, next, redirect) => {
    let errorCode = httpStatus.StatusCodes.NETWORK_AUTHENTICATION_REQUIRED;
    res.status(errorCode);
    req.flash("error", "You must be logged in to access the requested page.");
    let path = "/user/login";
    if (typeof redirect !== 'undefined') path += "?redirect=" + encodeURI(redirect);
    res.redirect(path);
}