let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');


exports.getUserById = (id,callback) =>{
    return User.findById(id,callback);
}
exports.getUserByIdentify = (user_id, callback) =>{
    return User.findOne({'UserId': user_id},callback);
}

exports.connection = (user_id,password,callback) =>{
    return User.findOne({'UserId' : user_id, 'UserPassword': password},callback);
}

exports.create = (id,pseudo,password,email) => {
    let instance = {
        UserId : id,
        UserPseudo : pseudo,
        UserPassword : password,
        UserEmail : email
    }
    return new User(instance);
}
exports.save = (user, callback) => {
    return user.save(callback);
}
exports.updateById = (id, news, callback) => {
    return User.findOneAndUpdate(id,news,callback);
}
exports.isConnected = (req) =>{
    if(req.session){
        if(req.session.user_id){
            return true;
        }
    }
    return false;
}