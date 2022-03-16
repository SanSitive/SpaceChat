let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const {DateTime} = require('luxon');

let UserSchema = new Schema(
    {
        UserPseudo : {type: String, minLength:4, maxLength:30, required: true },
        UserPassword : {type: String, required: true, minLength:4},
        UserName : {type: String, required: true, minLength:4, maxLength:30},
        UserStatus : {type: String, enum : ['Classic','Admin','Banned'], default: 'Classic'},
        UserBiography : {type: String, maxLength: 150},
        UserPicture : {type: String, default: undefined},
        UserFollower : [{type: Schema.Types.ObjectId, ref:'User'}],
        UserFollowing : [{type: Schema.Types.ObjectId, ref:'User'}]
        
    }
);

//Virtual url
UserSchema.virtual('url').get(function(){
    return '/user/' + this._id;
});


//Export
module.exports = mongoose.model('User',UserSchema);