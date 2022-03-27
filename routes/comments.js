let express = require('express');
let router = express.Router();
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
let user_controller= require('../controllers/userController');
let search_controller = require('../controllers/searchController');
let feed_controller = require('../controllers/feedController');
let connection_controller = require('../controllers/connectionController');
const comment_controller = require('../controllers/commentController');
const { CustomValidation } = require('express-validator/src/context-items');


// COMMENTS ROUTES 
// POST comment on a post
router.post('/user/:user_id/post/:post_id',comment_controller.post_comment); 


//Exporter les routes
module.exports = router;