let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
const Tag = require('../models/tag');



exports.getCommentByParentPostId = (id,callback) =>{
    return Comment.find({'CommentPostId':id},callback);
}
