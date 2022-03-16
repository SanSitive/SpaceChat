let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');

/// CONNECTION ROUTES ///
// GET request for connection page.
exports.connection_get = function(req,res,next){
    res.render('connection_form',{title:'Connection'});
};

// POST connection check.
exports.connection_post = function(req,res,next){
    // Validate and sanitize fields.
    body('identifiant', 'Identifiant must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('password', 'Password must not be empty.').trim().isLength({ min: 1 }).escape(),
    console.log('here i am')
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    console.log('hey just there');
    //Create a user for temporary stock the data
    let user = {
        identifiant : req.body.identifiant,
        password : req.body.password
    };
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.render('connection_form', { title: 'Connection',user:user,errors: errors.array() });
        return;
    }
    else {
        // Data from form is valid. Check DB
        User.countDocuments({'UserPseudo': user.identifiant, 'UserPassword': user.password},function(err,user_res){
            if(err){ return next(err);}
            else if (user_res > 0){
                res.redirect('/home/feed');
            }else{
                res.render('connection_form', { title: 'Connection',user:user,errors: errors.array() });
            }
        });
    }
   

    
};
