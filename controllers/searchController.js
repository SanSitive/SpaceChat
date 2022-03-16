let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');



// GET request for Search page
exports.search_get = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : PAGE SEARCH');
};

// POST request for send Search form.
exports.search_post = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : PAGE SEARCH ENVOIE');
};