let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const {DateTime} = require('luxon');

let PostSchema = new Schema(
    {
        PostAuthor : {type: Schema.Types.ObjectId, ref: 'User', required: true},
        PostPicture : {type: String, required: false},
        PostDescription : {type: String, required: true, minLength:1, maxLength: 1500},
        PostLike : {type: Number, default: 0},
        PostDate : {type : Date, default: Date.now}
    }
);

//Virtual date for post
PostSchema.virtual('date').get(function(){
    return DateTime.fromJSDate(this.PostDate).toLocaleString(DateTime.DATETIME_MED);
})

//Virtual url for post
PostSchema.virtual('url').get(function(){
    return '/post/' + this._id;
});


//Export
module.exports  = mongoose.model('Post', PostSchema);