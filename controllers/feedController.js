let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
let Follow = require('../models/follow');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');
const post = require('../models/post');

const user_function = require('../API/user')
const post_function = require('../API/post')
const follow_function = require('../API/follow')


//Home page
exports.index = function(req,res,next){
    res.render('home',{title:'SpaceChat'});
}

//FEED page on GET
exports.feed_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user_res)=>{
            if(user_res){
                console.log('isok ?');
                follow_function.getAllFollowBySuivant(user_res._id).then((abonnements_res)=>{
                    let abonnements = [];
                    for(let i =0; i< abonnements_res.length; i++){
                        abonnements.push(abonnements_res[i].UserIdSuivi);
                    }
                    console.log(abonnements)
                    shuffle(abonnements);
                    async.parallel([
                        function(callback){
                            Post.find({'PostAuthor':abonnements[0]}).populate('PostAuthor').exec((err,posts)=>{
                                if(err){callback(err)}
                                if(posts){callback(null,posts)}

                            })
                        },
                        function(callback){
                            Post.find({'PostAuthor':abonnements[1]}).populate('PostAuthor').exec((err,posts)=>{
                                if(err){callback(err)}
                                if(posts){callback(null,posts)}

                            })
                        },
                        function(callback){
                            Post.find({'PostAuthor':abonnements[2]}).populate('PostAuthor').exec((err,posts)=>{
                                if(err){callback(err)}
                                if(posts){callback(null,posts)}

                            })
                        },
                    ],
                    function(err,resultat){
                        if(err){console.log('there is an error')}
                        if(resultat){
                            let posts = [];
                            for(let i =0; i<resultat.length; i++){
                                for(let j=0; j<resultat[i].length;j++){
                                    posts.push(resultat[i][j]);
                                }
                            }
                            let PostARenvoyer =[];
                            for(let i=0; i<posts.length; i++){
                                let instance = {
                                    PostPicture : posts[i].PostPicture,
                                    PostDescription : posts[i].PostDescription,
                                    PostLike : posts[i].PostLike,
                                    PostDate : posts[i].date,
                                    PostTags : posts[i].PostTags,
                                    PostAuthorId : posts[i].PostAuthor.UserId,
                                    _id: posts[i]._id,
                                    UserPicture: posts[i].PostAuthor.UserPicture
                                }
                                PostARenvoyer.push(instance);
                                PostARenvoyer.sort(function compare(a,b){return b.PostDate - a.PostDate});
                            }
                            if(PostARenvoyer.length > 0){
                                res.render('feed',{title:'Feed',posts:PostARenvoyer})
                            }else{
                                post_function.getAllPosts_PopulatedByAuthor().then((posts)=>{
                                    let PostARenvoyer = [];
                                    for(let i=0; i<posts.length; i++){
                                        if(posts[i].PostAuthor.UserStatus != 'Banned'){
                                            let instance = {
                                                PostPicture : posts[i].PostPicture,
                                                PostDescription : posts[i].PostDescription,
                                                PostLike : posts[i].PostLike,
                                                PostDate : posts[i].date,
                                                PostTags : posts[i].PostTags,
                                                PostAuthorId : posts[i].PostAuthor.UserId,
                                                _id: posts[i]._id,
                                                UserPicture: posts[i].PostAuthor.UserPicture
                                            }
                                            PostARenvoyer.push(instance);
                                        }
                                    }
                                    PostARenvoyer.sort(function compare(a,b){return b.PostDate - a.PostDate});
                                    console.log(PostARenvoyer);
                                    res.render('feed',{title:'Feed', posts:PostARenvoyer});
                                })
                            }
                        }

                    })/* NOT WORKING FOR NOW BUT IS WHAT WE NEED TO DO TO BE OPTIMAL
                    async.each(abonnements,function(abo,callback){
                        post_function.getAllPostByAuthorIdPopulated(abo).then((post_res)=>{
                            if(post_res){
                                for(let i=0; i<post_res.length; i++){
                                    posts.push(post_res[i]);
                                }
                                callback(post_res)
                            }
                        })
                    },function(err){
                        if(err){
                            console.log('there is an error');
                        }
                        console.log(posts)
                        posts.sort(function compare(a,b){return b.PostDate - a.PostDate})
                        let PostARenvoyer = [];
                        for(let i=0; i<posts.length; i++){
                            let instance = {
                                PostPicture : posts[i].PostPicture,
                                PostDescription : posts[i].PostDescription,
                                PostLike : posts[i].PostLike,
                                PostDate : posts[i].PostDate,
                                PostTags : posts[i].PostTags,
                                PostAuthorId : posts[i].PostAuthor.UserId,
                                _id: posts[i]._id
                            }
                            PostARenvoyer.push(instance);
                        }
                        if(PostARenvoyer.length > 0){
                            res.render('feed',{title:'Feed',posts:PostARenvoyer})
                        }else{
                            post_function.getAllPosts_PopulatedByAuthor().then((posts)=>{
                                posts.sort(function compare(a,b){return b.PostDate - a.PostDate});
                                let PostARenvoyer = [];
                                for(let i=0; i<posts.length; i++){
                                    let instance = {
                                        PostPicture : posts[i].PostPicture,
                                        PostDescription : posts[i].PostDescription,
                                        PostLike : posts[i].PostLike,
                                        PostDate : posts[i].PostDate,
                                        PostTags : posts[i].PostTags,
                                        PostAuthorId : posts[i].PostAuthor.UserId,
                                        _id: posts[i]._id
                                    }
                                    PostARenvoyer.push(instance);
                                }
                                console.log(PostARenvoyer);
                                res.render('feed',{title:'Feed', posts:PostARenvoyer});
                            })
                        }
                    });*/
                })
            }else{
                post_function.getAllPosts_PopulatedByAuthor().then((posts)=>{
                    posts.sort(function compare(a,b){return b.PostDate - a.PostDate});
                    let PostARenvoyer = [];
                    for(let i=0; i<posts.length; i++){
                        if(posts[i].PostAuthor.UserStatus != 'Banned'){
                            let instance = {
                                PostPicture : posts[i].PostPicture,
                                PostDescription : posts[i].PostDescription,
                                PostLike : posts[i].PostLike,
                                PostDate : posts[i].date,
                                PostTags : posts[i].PostTags,
                                PostAuthorId : posts[i].PostAuthor.UserId,
                                _id: posts[i]._id,
                                UserPicture: posts[i].PostAuthor.UserPicture
                            }
                            PostARenvoyer.push(instance);
                        }
                    }
                    console.log(PostARenvoyer);
                    res.render('feed',{title:'Feed', posts:PostARenvoyer});
                })
            }
        })
    }else{
        post_function.getAllPosts_PopulatedByAuthor().then((posts)=>{
            posts.sort(function compare(a,b){return b.PostDate - a.PostDate});
            let PostARenvoyer = [];
            for(let i=0; i<posts.length; i++){
                if(posts[i].PostAuthor.UserStatus != 'Banned'){
                    let instance = {
                        PostPicture : posts[i].PostPicture,
                        PostDescription : posts[i].PostDescription,
                        PostLike : posts[i].PostLike,
                        PostDate : posts[i].date,
                        PostTags : posts[i].PostTags,
                        PostAuthorId : posts[i].PostAuthor.UserId,
                        _id: posts[i]._id
                    }
                    PostARenvoyer.push(instance);
                }
            }
            console.log(PostARenvoyer);
            res.render('feed',{title:'Feed', posts:PostARenvoyer});
        })
    }

}

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}