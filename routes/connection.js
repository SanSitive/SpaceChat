var express = require('express');
var router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads/');
    },
    filename: function(req,file,cb){
        cb(null, new Date().toISOString() + file.originalname)
    }
});

const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        //accept a file
        cb(null,true);
    }else{
        //reject a file
        cb(null,false);
    }
};
const upload = multer({
    storage:storage,
    limits: {fileSize: 1024 * 1024},
    fileFilter: fileFilter
})

//Required controller modules
var user_controller= require('../controllers/userController');
var search_controller = require('../controllers/searchController');
var feed_controller = require('../controllers/feedController');
var connection_controller = require('../controllers/connectionController');
const comment_controller = require('../controllers/commentController');
const { CustomValidation } = require('express-validator/src/context-items');

/// CONNECTION ROUTES ///
// GET request for connection page.
router.get('/connection',connection_controller.connection_get);

// GET connection check.
router.get('/connection/data',connection_controller.connection_getdata);

// GET request for disconnection page.
router.get('/disconnect',connection_controller.disconnection_get);


//Exporter les routes
module.exports = router;