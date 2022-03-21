let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
let Follow = require('../models/follow');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');
const post = require('../models/post');

//Home page
exports.index = function(req,res,next){
    res.render('home',{title:'SpaceChat'});
}

exports.feed_get = function(req,res,next){
    if(req.session){
        User.findById(req.session.user_id,function(err,user_res){
            if(err){
                return next(err);
            }else if (user_res){
                console.log('isok ?');
                Follow.find({'UserIdSuivant':user_res._id},function(err,abonnements_res){
                    if(err){return next(err);}
                    let abonnements = [];
                    for(let i =0; i< abonnements_res.length; i++){
                        abonnements.push(abonnements_res[i]);
                    }
                    console.log('enfin ici')
                    let posts = [];
                    async.each(abonnements,function(abo,callback){
                        Post.find({'PostAuthor':abo},function(err,post_res){
                            if(err){return next(err);}
                            if(post_res){
                                for(let i=0; i<post_res.length; i++){
                                    posts.push(post_res[i]);
                                }
                                callback(null)
                            }
                        })
                    },function(err){
                        if(err){
                            console.log('there is an error');
                        }
                        console.log(posts)
                        posts.sort(function compare(a,b){return b.PostDate - a.PostDate})
                        res.render('feed',{title:'Feed',posts:posts})
                    });
                })
            }else{
                console.log('not ok')
                Post.find({}).populate('PostAuthor').exec(function(err,posts_res){
                    if(err){return next(err);}
                    posts_res.sort(function compare(a,b){return b.PostDate - a.PostDate});
                    let PostARenvoyer = [];
                    for(let i=0; i<posts_res.length; i++){
                        let instance = {
                            PostPicture : posts_res[i].PostPicture,
                            PostDescription : posts_res[i].PostDescription,
                            PostLike : posts_res[i].PostLike,
                            PostDate : posts_res[i].PostDate,
                            PostTags : posts_res[i].PostTags,
                            PostAuthorId : posts_res[i].PostAuthor.UserId,
                            _id: posts_res[i]._id
                        }
                        PostARenvoyer.push(instance);
                    }
                    console.log(PostARenvoyer);
                    res.render('feed',{title:'Feed', posts:PostARenvoyer});
                })
            }
        }); 
    }else{
        Post.find({}).populate('PostAuthor').exec(function(err,posts_res){
            if(err){return next(err);}
            posts_res.sort(function compare(a,b){return b.PostDate - a.PostDate});
            let PostARenvoyer = [];
            for(let i=0; i<posts_res.length; i++){
                let instance = {
                    PostPicture : posts_res[i].PostPicture,
                    PostDescription : posts_res[i].PostDescription,
                    PostLike : posts_res[i].PostLike,
                    PostDate : posts_res[i].PostDate,
                    PostTags : posts_res[i].PostTags,
                    PostAuthorId : posts_res[i].PostAuthor.UserId,
                    _id: posts_res[i]._id
                }
                PostARenvoyer.push(instance);
            }
            console.log(PostARenvoyer);
            res.render('feed',{title:'Feed', posts:PostARenvoyer});
        })
    }

}