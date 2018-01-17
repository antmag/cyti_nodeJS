/**
 * Created by Robin on 20/12/2017.
 */

var mongoose = require('mongoose'), Schema = mongoose.Schema;


/**
 * Schema definition
 */


//schema pour un utilisateur
var userSchema = new Schema({
    id_facebook: String,
    username: String,
    login: String,
    mdp: String,
    owner: Boolean,
    surveys: [Schema.Types.ObjectId],
    points: Number,
    url_fb_picture: String
});

var user=mongoose.model('user', userSchema);
module.exports = user;
