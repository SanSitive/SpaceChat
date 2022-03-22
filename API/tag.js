let User = require ('../models/user');
let async = require('async');
let Post = require('../models/post');
let Comment = require('../models/comment');
const Tag = require('../models/tag');



exports.getAllTags = (callback) =>{
    return Tag.find({},callback);
}
exports.create = (name) => {
    let instance = {
        TagName : name
    }
    return new Tag(instance);
}
exports.save = (tag, callback) => {
    return tag.save(callback);
}