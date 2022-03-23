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
const { CustomValidation } = require('express-validator/src/context-items');



/// HOME PAGE ///
// GET home page.
router.get('/', feed_controller.index);


/// FEED ROUTES ///
// GET request for Feed page
router.get('/feed', feed_controller.feed_get);


/// CONNECTION ROUTES ///
// GET request for connection page.
router.get('/connection',connection_controller.connection_get);

// POST connection check.
router.post('/connection',connection_controller.connection_post);

// GET request for disconnection page.
router.get('/disconnect',connection_controller.disconnection_get);





/// USER ROUTES ///
// GET request for creating User
router.get('/user/create', user_controller.user_create_get);

// POST request for creating User
router.post('/user/create', user_controller.user_create_post);

// GET request for one User
router.get('/user/:id', user_controller.user_detail_get);

// GET request for User page parameter
router.get('/user/:id/parameter',user_controller.user_parameter_get);

// POST(PUT not working for forms) request for User page parameter
router.post('/user/:id/parameter',user_controller.user_parameter_post);

// GET request to update User.
router.get('/user/:id/update', user_controller.user_updatepage_get);

// POST(PUT not working for forms) request to update User.
router.post('/user/:id/update',upload.single('picture'), user_controller.user_updatepage_post);

// GET request for create post page
router.get('/user/:user_id/post/create', user_controller.user_create_postpage_get);

// POST request for ceating post page
router.post('/user/:user_id/post/create',upload.single('picture'), user_controller.user_create_postpage_post);

// GET request for specific post
router.get('/user/:user_id/post/:post_id', user_controller.user_specific_postpage_get);

// GET request for update a specific post
router.get('/user/:user_id/post/:post_id/update', user_controller.user_specific_post_updatepage_get);

// POST (PUT not working for forms) request for update a specific post 
router.post('/user/:user_id/post/:post_id/update', user_controller.user_specific_post_updatepage_post);

// PUT request for update a specific post 
router.put('/user/:user_id/post/:post_id/update', user_controller.user_specific_post_updatepage_put);

// GET request for specific post on delete page
router.get('/user/:user_id/post/:post_id/delete', user_controller.user_specific_post_deletepage_get);

// POST (DELETE not working for a form) request for specific post on delete page
router.post('/user/:user_id/post/:post_id/delete', user_controller.user_specific_post_deletepage_post);

//GET request for all banned users
router.get('/users/banned', user_controller.user_get_all_banned);
// GET request for unban someone page.
router.get('/user/:id/unban',user_controller.user_unban_someone_get);
//POST (PUT currently not working on post, searching alternative) request for unbann someone page.
router.post('/user/:id/unban', user_controller.user_unban_someone_post);
// GET request for ban someone page.
router.get('/user/:id/ban',user_controller.user_ban_someone_get);
//POST (PUT currently not working on post, searching alternative) request for ban someone page.
router.post('/user/:id/ban', user_controller.user_ban_someone_post);





/// SEARCH ROUTES ///
// GET request for Search page
router.get('/search', search_controller.search_get);

// POST request for send Search form.
router.post('/search', search_controller.search_post);


//Exporter les routes
module.exports = router;