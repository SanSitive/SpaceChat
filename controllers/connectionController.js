let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');


const user_function = require('../API/user');

/// CONNECTION ROUTES ///
// GET request for connection page.
exports.connection_get = function(req,res,next){
    res.render('connection_form',{title:'Connection'});
};

// POST connection check.
exports.connection_post = function(req,res,next){
    // Validate and sanitize fields.
    body('identifiant', 'Identifiant must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('password', 'Password must not be empty.').trim().isLength({ min: 1 }).escape()
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    
    //Create a user for temporary stock the data
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.render('connection_form', { title: 'Connection',user:req.body,errors: errors.array() });
        return;
    }
    else {
        let user = {
            pseudo : req.body.identifiant,
            password : req.body.password
        };
        // Data from form is valid. Check DB
        user_function.connection(user.pseudo,user.password).then((user) => {
            if (user){
                const sess= req.session;
                sess.user_id = user._id;
                res.redirect(user.url);
            }else{
                let erros = "Votre mot de passe ou identifiant n'est pas le bon";
                res.render('connection_form', { title: 'Connection',user:req.body,erros: erros });
            }
        })
    }
   

    
};

// GET request for disconnection page.
exports.disconnection_get = function(req,res,next){
    if(user_function.isConnected(req)){
        req.session.destroy();
    }
    res.redirect('/home')
}