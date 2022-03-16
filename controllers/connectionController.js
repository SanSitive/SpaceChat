let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');

/// CONNECTION ROUTES ///
// GET request for connection page.
exports.connection_get = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : PAGE CONNECTION GET');
};

// POST connection check.
exports.connection_post = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : PAGE CONNECTION POST ENVOIE');
};
