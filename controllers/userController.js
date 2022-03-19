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



// GET request for one User
exports.user_detail_get = function(req,res,next){
    async.waterfall([
        function(callback){
            User.findOne({'UserId': req.params.id},function(err,user){
                if(err){
                    callback(err)
                }else if (!user){
                    res.render('error',{title: 'User '+ req.params.id + 'not found', errors: err})
                }else{
                    callback(user)
                }
            })
        }
    ],
    function(user, callback){
        Post.find({'PostAuthor': user._id},function(err,posts){
            if(err){
                callback(err);
            }else if (!posts){
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
        let temp = {
            identifiant : req.body.identifiant,
            pseudo : req.body.pseudo,
            password : req.body.password
        };
        // Data from form is valid. Check DB
        User.findOne({'UserId': temp.identifiant},function(err,user_res){
            if(err){ return next(err);}
            else if (!user_res){
                let utilisateur = new User(
                    {
                        UserId : temp.identifiant,
                        UserPseudo : temp.pseudo,
                        UserPassword : temp.password
                    }
                );
                utilisateur.save(function (err) {
                    if (err) { return next(err); }
                    // Successful - redirect to new author record.
                    res.redirect(utilisateur.url);
                });
            }else{
                let erros = "Votre identifiant n'est pas disponible";
                res.render('user_form', { title: 'User Form',user:req.body,erros: erros });
            }
        });
    }
};

// GET request to update User.
exports.user_updatepage_get = function(req,res,next){
    
    res.send('PAS ENCORE IMPLEMENTE : USER UPDATE PAGE');
};

// PUT request to update User.
exports.user_updatepage_put = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER UPDATE PAGE ENVOIE PUT');
};

// GET request for create post page
exports.user_create_postpage_get = function(req,res,next){
    if(req.session){
        User.findById(req.session.user_id,function(err,user_res){
            if(err){
                return next(err);
            }else if (user_res){
                if(req.params.user_id == user_res.UserId){
                    res.render('post_form',{title: 'Post Form'});
                }else{
                    console.log('p1');
                    res.redirect('/home/feed');
                }
            }else{
                console.log('p2')
                res.redirect('/home/feed');
            }
        }); 

    }else{
        console.log('p3')
        res.redirect('/home/feed');
    }
};

// POST request for ceating post page
exports.user_create_postpage_post = function(req,response,next){
    console.log(req.file);
    // Validate and sanitize fields.
    body('description', 'Identifiant must not be empty.').trim().escape()
    
    // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    
    //Create a user for temporary stock the data
    
    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        response.render('post_form', { title: 'User Form',post:req.body,errors: errors.array() });
        return;
    }
    else {
        if(req.session){
            User.findById(req.session.user_id,function(err,user_res){
                if(err){
                    return next(err);
                }else if (user_res){
                    if(req.params.user_id == user_res.UserId){
                        Tag.find({},function(err,result){
                            if(err){ next(err)
                                return
                            }
                            let temp_tag = extractTags(req.body.description);
                            let temp = {
                                description : req.body.description,
                                tags : temp_tag,
                            };
                            let post ={
                                    PostAuthor : user_res._id,
                                    PostDescription : temp.description,
                                    PostTags : lowerCaseTab(temp.tags)
                                }
                            let tagsNotCreated= [];
                            let tagsCreated = [];
                            let tempTag = [];
                            console.log(post.PostTags)
                            for(let i =0; i<result.length; i++){
                                tempTag.push(result[i].TagName);
                            }
                            console.log(tempTag)
                            for(let j=0; j<post.PostTags.length; j++){
                                console.log(post.PostTags[j])
                                if(tempTag.indexOf(post.PostTags[j]) == -1){
                                    tagsNotCreated.push(post.PostTags[j]);
                                }else{
                                    tagsCreated.push(post.PostTags[j])
                                }
                            }
                            console.log('TAG NOT CREATED PUIS TAG CREATED')
                            console.log(tagsNotCreated)
                            console.log(tagsCreated)
                            let tempObject = {};
                            for(let i =0; i<result.length; i++){
                                tempObject[result[i].TagName] = result[i]._id;
                            }
                            console.log(tempObject);
                            let tagsIdCreated = [];
                            for(let i =0; i<tagsCreated.length; i++ ){
                                tagsIdCreated.push(tempObject[tagsCreated[i]]);
                                console.log(tagsIdCreated);
                            }
                            async.each(tagsNotCreated,function(tag,callback){
                                let instance = new Tag({ TagName: tag });    
                                instance.save(function (err) {
                                if (err) {
                                    callback(err, null);
                                    return;
                                }
                                console.log('New Tag: ' + instance);
                                tagsIdCreated.push(instance._id);
                                callback(null, instance);
                                }   );
                            },function(err){
                                if(err){
                                    console.log('there is an error');
                                }
                                post.PostTags = tagsIdCreated;
                                console.log(tagsIdCreated);
                                let instance = new Post({
                                    PostDescription: post.PostDescription,
                                    PostAuthor: post.PostAuthor,
                                    PostTags: post.PostTags,
                                    PostPicture: req.file.path
                                })
                                instance.save(function(err){
                                    if (err) {next(err)
                                        return};
                                    response.redirect('/home/user/'+user_res.UserId)
                                })
                            });
                        })

                    }else{
                        response.redirect('/home/feed');
                    }
                }else{
                    response.redirect('/home/feed');
                }
            }); 
        }else{
            response.redirect('/home/feed');
        }
    }
};

// GET request for specific post
exports.user_specific_postpage_get = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER SPECIFIC POST PAGE');
};

// GET request for update a specific post
exports.user_specific_post_updatepage_get = function(req,res,next){
    if(req.session){
        User.findById(req.session.user_id,function(err,user_res){
            if(err){
                return next(err);
            }else if (user_res){
                if(req.params.user_id == user_res.UserId){
                    Post.findById(req.params.post_id,function(err,post_res){
                        if(err){
                            return next(err)
                        }
                        if(post_res){
                            res.render('post_update_form',{title: 'Post Form',post: post_res});
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
        }); 

    }else{
        console.log('p3')
        res.redirect('/home/feed');
    }
};

// PUT request for update a specific post
exports.user_specific_post_updatepage_put = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER SPECIFIC POST UPDATE ENVOIE');
};

// GET request for specific post on delete page
exports.user_specific_post_deletepage_get = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER SPECIFIC POST DELETE PAGE');
};

// DELETE request for specific post on delete page
exports.user_specific_post_deletepage_delete = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : USER SPECIFIC POST DELETE ENVOIE');
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