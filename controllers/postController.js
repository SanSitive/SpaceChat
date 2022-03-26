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


// GET request for create post page
exports.user_create_postpage_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then( (user) => {
            if(user){
                if(req.params.user_id == user.UserId){
                    let session;
                    if(user_function.isConnected(req)){session = req.session}
                    res.render('post_form',{title: 'Post Form', session:session});
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
        let session;
        if(user_function.isConnected(req)){session = req.session}
        res.render('post_detail',{title: 'Post detail', post: resultat[0],userPicture: user,comments: comments, session:session})
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
                            let session;
                            if(user_function.isConnected(req)){session = req.session}
                            res.render('post_update_form',{title: 'Post Form',post: post, session:session});
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


// PATCH request for update a specific post
exports.user_specific_post_updatepage_patch = function(req,response,next){
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


// GET request for specific post on delete page
exports.user_specific_post_deletepage_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user) => {
            if (user){
                if(req.params.user_id == user.UserId || user.UserStatus == 'Admin'){
                    post_function.getPostById(req.params.post_id).then((post) =>{
                        if (post){
                            let session;
                            if(user_function.isConnected(req)){session = req.session}
                            res.render('post_delete',{title: 'Delete Form', post: post, session:session})
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



// DELETE request for specific post on delete page
exports.user_specific_post_deletepage_delete = function(req,res,next){
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