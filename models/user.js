let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const {DateTime} = require('luxon');

let UserSchema = new Schema(
    {
        UserId : {type: String, minLength:4, maxLength:30, required: true },
        UserPassword : {type: String, required: true, minLength:4},
        UserPseudo : {type: String, required: true, minLength:4, maxLength:30},
        UserStatus : {type: String, enum : ['Classic','Admin','Banned'], default: 'Classic'},
        UserBiography : {type: String, maxLength: 150},
        UserPicture : {type: String, default: undefined}
        
    }
);

//Virtual url
UserSchema.virtual('url').get(function(){
    return '/home/user/' + this.UserId;
});


//Export
module.exports = mongoose.model('User',UserSchema);