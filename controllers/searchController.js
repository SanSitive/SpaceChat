let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
let mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');

const user_function = require('../API/user');
const post_function = require('../API/post');
const follow_function = require('../API/follow');



// GET request for Search page
//Currently not working 
/* 
exports.search_get = function(req,res,next){
    if(user_function.isConnected(req)){
        user_function.getUserById(req.session.user_id).then((user)=>{
            if(user){
                follow_function.getAllFollowNotEqualSuivant(user._id).then((non_abonnements_res) =>{
                    let non_abonnements = [];
                    for(let i =0; i< non_abonnements_res.length; i++){
                        non_abonnements.push(non_abonnements_res[i].UserIdSuivi);
                    }
                    let posts = [];
                    async.eachSeries(non_abonnements,function(non_abo,callback){
                        post_function.getAllPostByAuthorIdPopulated(non_abo).then((post_res)=>{
                            if(post_res){
                                for(let i=0; i<post_res.length; i++){
                                    posts.push(post_res[i]);
                                }
                                callback(post_res)
                            }
                        })
                    console.log(non_abonnements_res)
                    console.log('entre deux')
                    console.log(posts)
                    },function(err){
                        if(err){
                            console.log('there is an error');
                        }
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
                        if(posts.length > 0){
                            res.render('search',{title:'Search',posts:PostARenvoyer})
                        }else{
                            //Si la personne est abonnée à tous les comptes
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
                                res.render('search',{title:'Search', posts:PostARenvoyer});
                            })
                        }
                    })
                })
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
                    res.render('search',{title:'Search', posts:PostARenvoyer});
                })
            }
        })
    }else{
        //Générique random posts
        post_function.getAllPosts_PopulatedByAuthor().then((posts)=>{
            shuffle(posts);
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
            res.render('search',{title:'Search', posts:PostARenvoyer});
        })
    }
};*/
//Alternative GET (Users may find people who they already follow)
exports.search_get = function(req,res,next){
    post_function.getAllPosts_PopulatedByAuthor().then((posts)=>{
        posts.sort(function compare(a,b){return b.PostDate - a.PostDate});
        let PostARenvoyer = [];
        for(let i=0; i<posts.length; i++){
            if(posts[i].PostAuthor.UserStatus != 'Banned'){
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
        }
        shuffle(PostARenvoyer);
        res.render('search',{title:'Search', posts:PostARenvoyer});
    })
}


// POST request for send Search form.
exports.search_post = function(req,res,next){
    res.send('PAS ENCORE IMPLEMENTE : PAGE SEARCH ENVOIE');
};




function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}