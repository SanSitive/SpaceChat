let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');

//Home page
exports.index = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : PAGE D ACCUEIL');
}

exports.feed_get = function(req,res,next){
    res.send('PAGE ENCORE IMPLEMENTE : PAGE DE FEED');
}