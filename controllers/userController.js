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
const tag_function = require('../API/tag')

// GET request for one User
exports.user_detail_get = function(req,res,next){
    async.waterfall([
        function(callback){
            user_function.getUserByIdentify(req.params.id).then((user) => {
                if(!user){
                    res.render('user_detail',{title: 'User '+ req.params.id + ' not found'})
                }else{
                    callback(user)
                }
            })

        }
    ],
    function(user, callback){
        post_function.getPostByAuthorId(user._id).then((posts) => {
            if(!posts){
                res.render('user_detail',{title: 'User ' + req.params.id, user:user})
            }else{
                res.render('user_detail',{title: 'User ' + req.params.id, user:user, posts:posts})
            }
        })
    }
    )
};

// GET request for creating User
exports.user_create_get = function (req,res,next){
    res.render('user_form',{title:'User Form'})
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
                let user = user_function.create(req.body.identifiant, req.body.pseudo, passw, req.body.email)
                user_function.save(user).then(
                    res.redirect('/home/connection')
                )
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
                    res.render('user_update',{title: 'User Update Form',user:user });
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

// PUT request to update User.
exports.user_updatepage_post = function(req,res,next){
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

// GET request for create post page
exports.user_create_postpage_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then( (user) => {
            if(user){
                if(req.params.user_id == user.UserId){
                    res.render('post_form',{title: 'Post Form'});
                }else{
                    res.redirect('/home/feed');
                }
            }else{
                res.redirect('/home/feed');
            }
        })
    }else{
        console.log('p3')
        res.redirect('/home/feed');
    }
};

// POST request for ceating post page
exports.user_create_postpage_post = function(req,response,next){
    
    // Validate and sanitize fields.
    body('description', 'Identifiant must not be empty.').trim().escape()
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    
    //Create a user for temporary stock the data
    if (!req.body.description || !req.file){
        if(req.body.description){
            response.render('post_form',{title: 'Post form', post:req.body, erros: "Il faut choisir une image"})
        }else{
            response.render('post_form',{title:'Post form', erros: "Il faut choisir une image"})
        }
        return;
    }
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        response.render('post_form', { title: 'User Form',post:req.body,errors: errors.array() });
        return;
    }
    else {
        if(user_function.isConnected(req)){
            user_function.getUserById(req.session.user_id).then((user)=>{
                if(user){
                    if(req.params.user_id == user.UserId){
                        tag_function.getAllTags().then((tags) => {
                            let object = prepareTagToCreate(req,user,tags);
                            let tagsNotCreated = object.tagsNotCreated;
                            let tagsIdCreated = object.tagsIdCreated;
                            async.each(tagsNotCreated,function(tag,callback){
                                let instance = tag_function.create(tag);
                                tag_function.save(instance).then(() => {
                                    console.log('New Tag: ' + instance);
                                    tagsIdCreated.push(instance._id);
                                    callback(null, instance);
                                })
                            },function(err){
                                let post ={
                                    PostAuthor : user._id,
                                    PostDescription : req.body.description,
                                    PostTags : tagsIdCreated
                                }
                                let instance = post_function.create(post.PostDescription,post.PostAuthor,post.PostTags,req.file.path);
                                post.PostTags = tagsIdCreated;
                                post_function.save(instance).then(()=>{
                                    response.redirect('/home/user/'+user.UserId)

                                })
                            });
                        })
                    }
                }
            })
        }else{
            response.redirect('/home/feed');
        }
    }
};

// GET request for specific post
exports.user_specific_postpage_get = function(req,res,next){
    async.series([
        function(callback){
            Post.findOne({'_id': req.params.post_id}).populate('PostAuthor').exec(function(err,post){
                if(err){
                    callback(err)
                }
                callback(null,post)
            })
        },
        function(callback){
            Comment.find({'CommentPostId': req.params.post_id}).populate('CommentAuthorId').exec(function(err,comments){
                if(err){
                    callback(err)
                }
                callback(null,comments)
            })
        }
    ],
    function(err,resultat){
        if(err){
            console.log(err)
            return next(err);
        }
        console.log(resultat)
        let user = resultat[0].PostAuthor.UserPicture;
        let comments = resultat[1].sort(function compare(a,b){ return b.CommentDate - a.CommentDate});
        res.render('post_detail',{title: 'Post detail', post: resultat[0],userPicture: user,comments: comments})
    }
    )
};

// GET request for update a specific post
exports.user_specific_post_updatepage_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user) => {
            if(user){
                if(req.params.user_id == user.UserId){
                    post_function.getPostById(req.params.post_id).then((post)=>{
                        if(post){
                            res.render('post_update_form',{title: 'Post Form',post: post});
                        }else{
                            res.redirect('/home/feed');
                        }
                    })
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
};

// POST (because PUT not working with form) request for update a specific post
exports.user_specific_post_updatepage_post = function(req,response,next){
    // Validate and sanitize fields.
    body('description', 'Identifiant must not be empty.').trim().escape()
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        response.render('post_form', { title: 'User Form',post:req.body,errors: errors.array() });
        return;
    }
    else {
        if(user_function.isConnected(req)){
            user_function.getUserById(req.session.user_id).then((user)=>{
                if(user){
                    if(req.params.user_id == user.UserId){
                        tag_function.getAllTags().then((tags) => {
                            let object = prepareTagToCreate(req,user,tags);
                            let tagsNotCreated = object.tagsNotCreated;
                            let tagsIdCreated = object.tagsIdCreated;
                            async.each(tagsNotCreated,function(tag,callback){
                                let instance = tag_function.create(tag);
                                tag_function.save(instance).then(() => {
                                    console.log('New Tag: ' + instance);
                                    tagsIdCreated.push(instance._id);
                                    callback(null, instance);
                                })
                            },function(err){
                                let news = { PostDescription: req.body.description, PostTags: tagsIdCreated}
                                post_function.update(req.params.post_id,news).then(()=>{
                                    response.redirect('/home/user/'+user.UserId+'/post/'+req.params.post_id)

                                })
                            });
                        })
                    }
                }
            })
        }else{
            response.redirect('/home/feed');
        }
    }
};

// PUT request for update a specific post  (TRY)
exports.user_specific_post_updatepage_put = function(req,res,next){
    console.log(req.body);
    res.send('yes');
    return 4;
}

// GET request for specific post on delete page
exports.user_specific_post_deletepage_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user) => {
            if (user){
                if(req.params.user_id == user.UserId || user.UserStatus == 'Admin'){
                    post_function.getPostById(req.params.post_id).then((post) =>{
                        if (post){
                            res.render('post_delete',{title: 'Delete Form', post: post})
                        }else{
                            res.redirect('/home/feed')
                        }
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
};

// POST (DELETE not working for a form) request for specific post on delete page
exports.user_specific_post_deletepage_post = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=> {
            if(user){
                if(req.params.user_id == user.UserId || user.UserStatus == 'Admin'){
                    post_function.delete(req.params.post_id).then(() =>{
                        //if success :
                        res.redirect('/home/user/'+req.params.user_id)
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
};

// GET request for User page parameter
exports.user_parameter_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user){
                if(req.params.id == user.UserId){
                    res.render('user_parameter',{title: 'User Update Form',user:user });
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

// POST(PUT not working for forms) request for User page parameter
exports.user_parameter_post = function(req,res,next){
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
                        user_function.updateById(user._id,news).then(()=>{
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
}

//GET request for all banned users
exports.user_get_all_banned = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user) => {
            if(user.UserStatus == 'Admin'){
                user_function.getAllUserBanned().then((users) => {
                    if(users){
                        res.render('banned',{title:'All Users Banned', users: users});
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
                        console.log(user_res)
                        res.render('user_unban',{title:'User '+req.params.id, user: user_res});
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

//POST (PUT currently not working on post, searching alternative) request for unban someone page
exports.user_unban_someone_post = function(req,res,next){
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
                        res.render('user_ban',{title:'User '+req.params.id, user: user_res});
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

//POST (PUT currently not working on post, searching alternative) request for ban someone page.
exports.user_ban_someone_post = function(req,res,next){
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

//USEFULS FUNCTIONS
function extractTags(str){
    const s = str;
    let indexs = [];
    for(let i =0; i< s.length; i++){
        if (s[i] === '#'){
            indexs.push(i);
        }
    }
    let spaces = [];
    for(let i= indexs[0]; i< s.length; i++){
        if (s[i] === ' '){
            spaces.push(i);
        }
    }

    let k = 0;
    let m = 0;
    resultat = {indexs : [], spaces: []};
    while (k<indexs.length && m<spaces.length){
        if(spaces[m] < indexs[k+1] && spaces[m] > indexs[k] && k!= indexs.length -1 ){
            resultat.indexs.push(indexs[k]);
            resultat.spaces.push(spaces[m]);
            k++;
            m++;
        }else if (spaces[m] > indexs[k] && k == indexs.length -1){
            resultat.indexs.push(indexs[k]);
            resultat.spaces.push(spaces[m]);
            k++;
            m++;
        }else{
            m++;
        }
    }
    if (indexs[indexs.length -1] > spaces[spaces.length -1]){
        resultat.indexs.push(indexs[indexs.length -1]);
        resultat.spaces.push(s.length);
    }

    let tags = [];
    for(let i =0; i<resultat.indexs.length; i++){
        tags.push(s.substring(resultat.indexs[i]+1, resultat.spaces[i]));
    }
    return tags;
};

function lowerCaseTab(tab){
    for(let i=0 ; i<tab.length; i++){
        tab[i] = tab[i].charAt(0).toLowerCase() + tab[i].slice(1);
    }
    return tab;
}

async function createTag(TagName,cb){
    let tag = new Tag({ TagName: TagName });    
    tag.save(function (err) {
    if (err) {
        cb(err, null);
        return;
    }
    console.log('New Tag: ' + tag);
    tags.push(tag)
    cb(null, tag);
    }   );
}

function prepareTagToCreate(req,user_res,tags){
    //Extraire les hashtags
    let temp_tag = extractTags(req.body.description + ' ');
    let temp = {
        description : req.body.description,
        tags : temp_tag,
    };
    //Post temporaire
    let post ={
            PostAuthor : user_res._id,
            PostDescription : temp.description,
            PostTags : lowerCaseTab(temp.tags)
    }
    let tagsNotCreated= [];
    let tagsCreated = [];
    let tempTag = []; //Stocker temporairement les noms des tags déjà créer afin des les comparer avec les hastags extraits
    for(let i =0; i<tags.length; i++){
        tempTag.push(tags[i].TagName);
    }
    //Répartir les tags à créer et ceux déjà créés
    for(let j=0; j<post.PostTags.length; j++){
        if(tempTag.indexOf(post.PostTags[j]) == -1){
            tagsNotCreated.push(post.PostTags[j]);
        }else{
            tagsCreated.push(post.PostTags[j])
        }
    }
    //Mettre dans un object les tags à créer que l'on passe dans un Array de tags déjà créer
    let tempObject = {};
    for(let i =0; i<tags.length; i++){
        tempObject[tags[i].TagName] = tags[i]._id;
    }
    let tagsIdCreated = [];
    for(let i =0; i<tagsCreated.length; i++ ){
        tagsIdCreated.push(tempObject[tagsCreated[i]]);
    }
    return {tagsNotCreated : tagsNotCreated, tagsIdCreated: tagsIdCreated};
}