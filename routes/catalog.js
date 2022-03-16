var express = require('express');
var router = express.Router();

//Required controller modules
var user_controller= require('../controllers/userController');
var search_controller = require('../controllers/searchController');
var feed_controller = require('../controllers/feedController');
var connection_controller = require('../controllers/connectionController');



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





/// USER ROUTES ///
// GET request for creating User
router.get('/user/create', user_controller.user_create_get);

// POST request for creating User
router.post('/user/create', user_controller.user_create_post);

// GET request for one User
router.get('/user/:id', user_controller.user_detail_get);

// GET request to update User.
router.get('/user/:id/update', user_controller.user_updatepage_get);

// PUT request to update User.
router.put('/user/:id/update', user_controller.user_updatepage_put);

// GET request for create post page
router.get('/user/:user_id/post/create', user_controller.user_create_postpage_get);

// POST request for ceating post page
router.get('/user/:user_id/post/create', user_controller.user_create_postpage_post);

// GET request for specific post
router.get('/user/:user_id/post/:post_id', user_controller.user_specific_postpage_get);

// GET request for update a specific post
router.get('/user/:user_id/post/:post_id/update', user_controller.user_specific_post_updatepage_get);

// PUT request for update a specific post
router.put('/user/:user_id/post/:post_id/update', user_controller.user_specific_post_updatepage_put);

// GET request for specific post on delete page
router.get('/user/:user_id/post/:post_id/delete', user_controller.user_specific_post_deletepage_get);

// DELETE request for specific post on delete page
router.delete('/user/:user_id/post/:post_id/delete', user_controller.user_specific_post_deletepage_delete);






/// SEARCH ROUTES ///
// GET request for Search page
router.get('/search', search_controller.search_get);

// POST request for send Search form.
router.post('/search', search_controller.search_post);


//Exporter les routes
module.exports = router;