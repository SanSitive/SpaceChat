let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
let Tag = require('../models/tag');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');
const multer = require('multer');
const upload = multer({
    dest: 'uploads/'
});
const { diffIndexes } = require('../models/user');

const user_function = require('../API/user');
const post_function = require('../API/post');
const tag_function = require('../API/tag');
const comment_function = require('../API/comment');


// COMMENTS ROUTES 
// POST comment on a post
exports.post_comment = function(req,res,next){
    // Validate and sanitize fields.
    body('content', 'Content must not be empty.').trim().isLength({ min: 1 }).escape()
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    console.log('p1')
    //Create a user for temporary stock the data
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.redirect('/home/user/'+req.params.user_id+'/post/'+req.params.post_id);
    }else if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user){
                console.log('p2')
                let instance = comment_function.create(req.params.post_id,user._id,req.body.content);
                console.log('p3')
                console.log(req.body)
                comment_function.save(instance).then((comment)=>{
                    console.log('p4')
                    res.redirect('/home/user/'+req.params.user_id+'/post/'+req.params.post_id);
                })
            }else{
                res.redirect('/home/user/'+req.params.user_id+'/post/'+req.params.post_id);
            }
        })
    }else{
        res.redirect('/home/user/'+req.params.user_id+'/post/'+req.params.post_id);
    }
} 