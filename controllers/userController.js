let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');



// GET request for one User
exports.user_detail_get = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER DETAIL PAGE');
};

// GET request for creating User
exports.user_create_get = function (req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER CREATE PAGE');
};

// POST request for creating User
exports.user_create_post = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER CREATE ENVOIE');
};

// GET request to update User.
exports.user_updatepage_get = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER UPDATE PAGE');
};

// PUT request to update User.
exports.user_updatepage_put = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER UPDATE PAGE ENVOIE PUT');
};

// GET request for create post page
exports.user_create_postpage_get = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER CREATE POST PAGE');
};

// POST request for ceating post page
exports.user_create_postpage_post = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER CREATE POST PAGE ENVOIE')
}

// GET request for specific post
exports.user_specific_postpage_get = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER SPECIFIC POST PAGE');
};

// GET request for update a specific post
exports.user_specific_post_updatepage_get = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER SPECIFIC POST UPDATE PAGE');
};

// PUT request for update a specific post
exports.user_specific_post_updatepage_put = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER SPECIFIC POST UPDATE ENVOIE');
};

// GET request for specific post on delete page
exports.user_specific_post_deletepage_get = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER SPECIFIC POST DELETE PAGE');
};

// DELETE request for specific post on delete page
exports.user_specific_post_deletepage_delete = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER SPECIFIC POST DELETE ENVOIE');
};
