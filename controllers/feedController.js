let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');

//Home page
exports.index = function(req,res,next){
    res.render('home',{title:'SpaceChat'});
}

exports.feed_get = function(req,res,next){
    res.render('feed',{title:'Feed'});
}