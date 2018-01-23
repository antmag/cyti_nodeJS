/**
 * Created by Robin on 19/12/2017.
 */

var mongoose = require('mongoose'), Schema = mongoose.Schema;

/**
 * Schema definition
 */

//schema for a survey
var surveySchema = new Schema({
    title: String,
    description: String,
    //start_date: Date,
    //end_date: Date,
    nb_answers: {type: Number, default: 0},
    survey_type: String,
    theme: String,
    status: String,
    points: Number,
    picture_url: String,
    duration: String,
    questions: [{type: Schema.Types.ObjectId, ref: 'question'}]
    },
    { versionKey: false
    });

/**
 * toJSON implementation
 */


// surveySchema compiled into survey Model
var survey = mongoose.model('survey', surveySchema);


module.exports = survey;