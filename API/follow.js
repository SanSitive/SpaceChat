let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
let Follow = require('../models/follow');
const Tag = require('../models/tag');



exports.getAllFollowBySuivant = (id,callback) =>{
    return Follow.find({'UserIdSuivant':id},callback);
}

exports.getAllFollowNotEqualSuivant = (id,callback) =>{
    return Follow.find({'UserIdSuivant':{$ne: id}},callback);
}
