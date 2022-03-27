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
const follow_function = require('../API/follow');
const bcrypt = require('bcryptjs/dist/bcrypt');

// GET request for one User
exports.user_detail_get = function(req,res,next){
    async.waterfall([
        function(callback){
            user_function.getUserByIdentify(req.params.id).then((user) => {
                if(!user){
                    let session;
                    if(user_function.isConnected(req)){session = req.session}
                    let resultat = {UserStatus : 'Banned'};
                    res.render('user_detail',{title: 'User '+ req.params.id + ' not found', session:session, user:resultat })
                }else{
                    callback(user)
                }
            })

        }
    ],
    function(user, callback){
        post_function.getPostByAuthorId(user._id).then((posts) => {
            let session;
            if(user_function.isConnected(req)){session = req.session}
            if(!posts){
                res.render('user_detail',{title: 'User ' + req.params.id, session:session, user:user})
            }else{
                res.render('user_detail',{title: 'User ' + req.params.id, user:user, session:session, posts:posts})
            }
        })
    }
    )
};

// GET request for creating User
exports.user_create_get = function (req,res,next){
    let session;
    if(user_function.isConnected(req)){session = req.session}
    res.render('user_form',{title:'User Form', session:session})
};

// POST request for creating User
exports.user_create_post = function(req,res,next){
    // Validate and sanitize fields.
    body('identifiant', 'Identifiant must not be empty.').trim().isLength({ min: 1 }).escape()
    body('pseudo', 'User name must not be empty.').trim().isLength({min: 1}).escape()
    body('email', 'Email must not be empty.').trim().isLength({ min: 1 }).escape()
    body('password', 'Password must not be empty.').trim().isLength({ min: 1 }).escape()
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    
    //Create a user for temporary stock the data
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.render('user_form', { title: 'User Form',user:req.body,errors: errors.array() });
        return;
    }
    else {
        //à encrypter
        let passw = req.body.password;
        user_function.getUserByIdentify(req.body.identifiant).then((user_res) => {
            if(!user_res){
                bcrypt.genSalt(10).then(salt =>{
                    bcrypt.hash(passw,salt).then(hashed =>{
                        let user = user_function.create(req.body.identifiant, req.body.pseudo, hashed, req.body.email)
                        user_function.save(user).then(
                            res.redirect('/home/connection')
                        )
                    })
                })
            }else{
                let erros = "Votre identifiant n'est pas disponible";
                res.render('user_form', { title: 'User Form',user:req.body,erros: erros })
            }
        })
    }
};

// GET request to update User.
exports.user_updatepage_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user) => {
            if(user){
                if(req.params.id == user.UserId){
                    let session;
                    if(user_function.isConnected(req)){session = req.session}
                    res.render('user_update',{title: 'User Update Form',user:user, session:session });
                }else{
                    console.log('p1');
                    res.redirect('/home/feed');
                }
            }
            else{
                console.log('p2')
                res.redirect('/home/feed');
            }
        })
    }else{
        console.log('p3')
        res.redirect('/home/feed');
    }
};

// PATCH request to update User.
exports.user_updatepage_patch = function(req,res,next){
    // Validate and sanitize fields.
    body('pseudo', 'Pseudo must not be empty.').trim().isLength({min:4}).escape();
    body('biography').trim().escape();
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    
    //Create a user for temporary stock the data
    if (!req.body.pseudo){
            res.render('user_update',{title:'User Update Form', erros: "Il faut choisir un pseudo de plus de 4 charactères"})
        return;
    }
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.render('user_update', { title: 'User Update Form',user:user,errors: errors.array() });
        return;
    }
    else {
        if(user_function.isConnected(req)){
            user_function.getUserById(req.session.user_id).then((user) =>{
                if(user){
                    if(req.params.id == user.UserId){
                        let news = {UserBiography: req.body.biography, UserPseudo: req.body.pseudo}
                        if(req.file){
                            news.UserPicture = req.file.path;
                        }
                        user_function.updateById(user._id,news).then((user) => {
                            res.redirect('/home/user/'+req.params.id);
                        })
                    }else{
                        res.redirect('/home/feed');
                    }
                }else{
                    res.redirect('/home/feed'); 
                }

            })
        }else{
            res.redirect('/home/feed');
        }
    }
};


// GET request for User page parameter
exports.user_parameter_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user){
                if(req.params.id == user.UserId){
                    let session;
                    if(user_function.isConnected(req)){session = req.session}
                    res.render('user_parameter',{title: 'User Update Form',user:user,session:session });
                }else{
                    console.log('p1');
                    res.redirect('/home/feed');
                }
            }else{
                console.log('p2')
                res.redirect('/home/feed');
            }
        }) 
    }else{
        console.log('p3')
        res.redirect('/home/feed');
    }
}

// PATCH request for User page parameter
exports.user_parameter_patch = function(req,res,next){
    // Validate and sanitize fields.
    body('email', 'Pseudo must not be empty.').trim().isLength({min:4}).escape();
    body('password1', 'Password must not be empty').trim().isLength({min:1}).escape();
    body('password2', 'Password must not be empty').trim().isLength({min:1}).escape();
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    let news = {UserEmail: req.body.email, UserPassword: req.body.password_a, UserPicture: undefined}
    //Create a user for temporary stock the data
    if (!req.body.email || !req.body.password_a || !req.body.password_b || (req.body.password_a != req.body.password_b)){
        if(req.body.password_a != req.body.password_b){
            console.log('here')
            res.render('user_parameter',{title:'User Parameter Form',user:news, erros: "Les password ne sont pas égaux"})
        }else{
            console.log('there')
            res.render('user_parameter',{title:'User Parameter Form',user:news, erros: "Il faut remplir le formulaire"})
        }
        return;
    }
    if (!errors.isEmpty()) {
        console.log('thereeeee')
        // There are errors. Render form again with sanitized values/error messages.
        res.render('user_update', { title: 'User Update Form',user:news,errors: errors.array() });
        return;
    }
    else {
        if(user_function.isConnected(req) && req.body.password1 == req.body.password2){
            user_function.getUserById(req.session.user_id).then((user)=>{
                if(user){
                    if(req.params.id == user.UserId){
                        bcrypt.genSalt(10).then(salt=>{
                            bcrypt.hash(news.UserPassword,salt).then(hashed=>{
                                news.UserPassword = hashed;
                                user_function.updateById(user._id,news).then(()=>{
                                    res.redirect('/home/user/'+req.params.id);
                            })
                        })
                        })
                    }else{
                        res.redirect('/home/feed');
                    }
                }else{
                    res.redirect('/home/feed');
                }
            })
        }else{
            res.redirect('/home/feed');
        }
    }
}

//GET request for all banned users
exports.user_get_all_banned = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user) => {
            if(user.UserStatus == 'Admin'){
                user_function.getAllUserBanned().then((users) => {
                    if(users){
                        let session;
                        if(user_function.isConnected(req)){session = req.session}
                        res.render('banned',{title:'All Users Banned', users: users, session:session});
                    }else{
                        res.redirect('/home/feed');
                    }
                })
            }else{
                res.redirect('/home/feed');
            }
        })
    }else{
        res.redirect('/home/feed');
    }
}

// GET request for unban someone page.
exports.user_unban_someone_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user.UserStatus == 'Admin'){
                user_function.getUserByIdentify(req.params.id).then((user_res)=>{
                    if(user_res){
                        let session;
                        if(user_function.isConnected(req)){session = req.session}
                        res.render('user_unban',{title:'User '+req.params.id, user: user_res, session:session});
                    }else{
                        res.redirect('/home/feed');
                    }
                })
            }else{
                res.redirect('/home/feed');
            }
        })
    }else{
        res.redirect('/home/feed');
    }
}

//PATCH request for unban someone page
exports.user_unban_someone_patch = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user.UserStatus == 'Admin'){
                user_function.getUserByIdentify(req.params.id).then((user_res)=>{
                    let news = {UserStatus : 'Classic'}
                    console.log(user_res._id)
                    console.log(user_res)
                    let id = user_res._id;
                    console.log(id)
                    user_function.updateById(id,news).then((final)=>{
                        res.redirect('/home/user/'+final.UserId);
                    })
                })
            }else{
                res.redirect('/home/feed');
            }
        })
    }else{
        res.redirect('/home/feed');
    }
}

// GET request for ban someone page.
exports.user_ban_someone_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user.UserStatus == 'Admin'){
                user_function.getUserByIdentify(req.params.id).then((user_res)=>{
                    if(user_res){
                        let session;
                        if(user_function.isConnected(req)){session = req.session}
                        res.render('user_ban',{title:'User '+req.params.id, user: user_res, session:session});
                    }else{
                        res.redirect('/home/feed');
                    }
                })
            }else{
                res.redirect('/home/feed');
            }
        })
    }else{
        res.redirect('/home/feed');
    }
}

//PATCH request for ban someone page.
exports.user_ban_someone_patch = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user.UserStatus == 'Admin'){
                user_function.getUserByIdentify(req.params.id).then((user_res)=>{
                    let news = {UserStatus : 'Banned'}
                    console.log(user_res._id)
                    user_function.updateById(user_res._id,news).then((final)=>{
                        res.redirect('/home/user/'+final.UserId);
                    })
                })
            }else{
                res.redirect('/home/feed');
            }
        })
    }else{
        res.redirect('/home/feed');
    }
}

//POST request for follow someone
exports.user_follow_someone_post = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserByIdentify(req.params.id).then(user =>{
            if(user){
                follow_function.isCurrentUserFollowing(req.session.user_id,user._id).then(follow =>{
                    if(!follow){
                        console.log('just before cata')
                        let instance = follow_function.create(req.session.user_id,user._id);
                        console.log('hey yo')
                        follow_function.save(instance).then(follow_res =>{
                            console.log('inside save')
                            res.redirect('/home/user/'+req.params.id);
                        })
                    }else{
                        console.log('inside the one')
                        res.redirect('/home/user/'+req.params.id)
                    }
                })
            }else{
                console.log('p3')
                res.redirect('/home/user/'+req.params.id)
            }
        })
    }else{
        console.log('p4')
        res.redirect('/home/user/'+req.params.id)
    }
}


//DELETE request for unfollow someone
exports.user_unfollow_someone_delete = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserByIdentify(req.params.id).then(user =>{
            if(user){
                follow_function.isCurrentUserFollowing(req.session.user_id,user._id).then(follow =>{
                    if(follow){
                        console.log('there')
                        follow_function.delete(follow._id).then(done=>{
                            console.log('here')
                            res.redirect('/home/user/'+req.params.id)
                        })
                    }else{
                        console.log('p2')
                        res.redirect('/home/user/'+req.params.id)
                    }
                })
            }else{
                res.redirect('/home/user/'+req.params.id)
            }
        })
    }else{
        res.redirect('/home/user/'+req.params.id)
    }
}
