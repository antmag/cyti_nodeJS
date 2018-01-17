/**
 * Created by Robin on 20/12/2017.
 */

var mongoose = require('mongoose'), Schema = mongoose.Schema;

/**
 * Schema definition
 */

//schema for users answers
var answers_userSchema = new Schema({
    id_user: String,
    id_survey: String,
    id_question: String,
    id_answer: [String]
    },{
    versionKey: false
    });





module.exports = mongoose.model('answers_user', answers_userSchema);