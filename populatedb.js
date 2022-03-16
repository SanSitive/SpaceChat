#! /usr/bin/env node

console.log('This script populates some user,posts,comments,tags to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
let userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
let User = require('./models/user');
let Post = require('./models/post');
let Tag = require('./models/tag');
let Comment = require('./models/comment');


let mongoose = require('mongoose');
let mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let users = []
let posts = []
let tags = []
let comments = []

function clearCollection(cb){
  async.series([
    function(callback){
      User.deleteMany({}, callback)
    },
    function(callback){
      Post.deleteMany({}, callback)
    },
    function(callback){
      Tag.deleteMany({}, callback)
    },
    function(callback){
      Comment.deleteMany({}, callback)
    }
  ],
  //optional callback
  cb)
}

function userCreate(UserPseudo, UserPassword, UserName, UserStatus, UserBiography, UserPicture, UserFollower, UserFollowing, cb) {
  userdetail = {UserPseudo:UserPseudo , UserPassword: UserPassword, UserName: UserName }
  if (UserStatus != false) userdetail.UserStatus = UserStatus;
  if (UserBiography != false) userdetail.UserBiography = UserBiography;
  if (UserPicture != false) userdetail.UserPicture= UserPicture;
  if (UserFollower != false) userdetail.UserFollower = UserFollower;
  if (UserFollowing != false) userdetail.UserFollowing = UserFollowing;
  
  let user = new User(userdetail);
       
  user.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New User: ' + user);
    users.push(user)
    cb(null, user)
  }  );
}

function tagCreate(TagName, cb) {
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

function postCreate(PostAuthor, PostPicture, PostDescription, PostLike, PostDate, cb) {
  postdetail = { 
    PostAuthor: PostAuthor,
    PostDescription: PostDescription
  }
  if (PostPicture != false) postdetail.PostPicture = PostPicture;
  if (PostLike != false) postdetail.PostLike = PostLike;
  if (PostDate != false) postdetail.PostDate= PostDate;
    
  let post = new Post(postdetail);    
  post.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Post: ' + post);
    posts.push(post)
    cb(null, post)
  }  );
}


function commentCreate(CommentPostId, CommentContent, CommentLike, CommentParent, CommentDate, cb) {
  commentdetail = { 
    CommentPostId: CommentPostId,
    CommentContent: CommentContent,
  }    
  if (CommentLike != false) commentdetail.CommentLike = CommentLike;
  if (CommentParent != false) commentdetail.CommentParent = CommentParent;
  if (CommentDate != false) commentdetail.CommentDate = CommentDate;
    
  let comment = new Comment(commentdetail);    
  comment.save(function (err) {
    if (err) {
      console.log('ERROR CREATING Comment: ' + comment);
      cb(err, null)
      return
    }
    console.log('New Comment: ' + comment);
    comments.push(comment)
    cb(null, comment)
  }  );
}


function createTags(cb) {
    async.series([
        function(callback) {
          tagCreate('fleurs', callback);
        },
        function(callback) {
          tagCreate('sun', callback);
        },
        function(callback) {
          tagCreate('moon', callback);
        },
        function(callback) {
          tagCreate('plage', callback);
        },
        function(callback) {
          tagCreate('montagne', callback);
        },
        function(callback) {
          tagCreate('espace', callback);
        },
        function(callback) {
          tagCreate('familly', callback);
        },
        function(callback) {
          tagCreate('plage', callback);
        },
        function(callback) {
          tagCreate('ocean', callback);
        },
        function(callback) {
          tagCreate('melenchon', callback);
        },
        function(callback) {
          tagCreate('lapin', callback);
        },
        function(callback) {
          tagCreate('jaimeLesLapins', callback);
        },
        function(callback) {
          tagCreate('vousConnaissezLesLapins', callback);
        },
        function(callback) {
          tagCreate('lapinatros', callback);
        },
        function(callback) {
          tagCreate('lapinAlbinos', callback);
        },
        ],
        // optional callback
        cb);
}


function createUsers(cb) {
    async.series([
        function(callback) {
          userCreate('Dokarus','0202','DorianCM',false,"Je suis un jeune étudiant d'IG3",false,false,false,callback);
        },
        function(callback) {
          userCreate('Ananaïs','JaimeLesFruits','ana_velcker',false,"Je suis végé et fière de l'être'",false,false,false,callback);
        },
        function(callback) {
          userCreate('Merluche','REPUBLIQUE','Melenchon',false,"Candidat à la présidentielle 2022 française",false,false,false,callback);
        },
        function(callback) {
          userCreate('MasterLapin','LapinForever01','Lapin','Admin',"Maitre ultime des lapins",false,[users[0],users[1],users[2]],false,callback);
        }
        ],
        // optional callback
        cb);
}


function createPosts(cb) {
    async.parallel([
        function(callback) {
          postCreate(users[0], false, "C'est un super post avec aucune image comme vous pouvez le voir", false, false, callback)
        },
        function(callback) {
          postCreate(users[0], false, "WAOUUUUUUH MON DEUXIEME POST", false, false, callback)
        },
        function(callback) {
          postCreate(users[1], false, "UN SUPER IMAGE INVISIBLE DE FRUIT", false, false, callback)
        },
        function(callback) {
          postCreate(users[2], false, "LA REPUBLIQUE C'EST MOI", false, false, callback)
        },
        function(callback) {
          postCreate(users[3], false, "Regardez ce magnifique lapin", false, false, callback)
        }
        ],
        // Optional callback
        cb);
}

function createComments(cb) {
  async.series([
      function(callback) {
        commentCreate(posts[0], "Félicitation pour ce post", false, false, false, callback)
      },
      function(callback) {
        commentCreate(posts[0], "Trop cool ce post !!!", false, false, false, callback)
      },
      function(callback) {
        commentCreate(posts[1], "YEAHHHHHH", false, false, false, callback)
      },
      function(callback) {
        commentCreate(posts[0], "Ce commentaire est trop cool", false, comments[0], false, callback)
      },
      function(callback) {
        commentCreate(posts[2], "Pas intéressant, supprime !!!", false, comments[3], false, callback)
      }
      ],
      // Optional callback
      cb);
}



async.series([
    clearCollection,
    createTags,
    createUsers,
    createPosts,
    createComments,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



