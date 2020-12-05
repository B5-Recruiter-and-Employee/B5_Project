const userController = require('../controllers/userController');
var router = require('express').Router();

router.get("/user/login", userController.login);
router.post("/user/login", userController.authenticate, userController.redirectView);
// router.post("/user/login", userController.login)
router.get("/user/signup", userController.signup);
router.post("/user/signup", userController.createAccount, userController.redirectView);

router.get("/user/:id", userController.show, userController.showView);   //just so I can redirect for now
router.get("/user/:id/edit", userController.edit);
router.post("/user/:id/update", userController.update, userController.redirectView);
router.get("/user/:id/delete", userController.delete, userController.redirectView);



module.exports = router;
