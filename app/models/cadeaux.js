/**
 * Created by Antoine on 15/01/2017.
 */

var mongoose = require('mongoose'), Schema = mongoose.Schema;

/**
 * Schema definition
 */

//schema for a survey
var cadeauxSchema = new Schema({
    title: String,
    description: String,
    //start_date: Date,
    //end_date: Date,
    cadeaux_type: String,
    points: Number,
    url: String,
    type: String},

    //picture: String,
    { versionKey: false
    });

/**
 * toJSON implementation
 */


// surveySchema compiled into survey Model
var cadeaux = mongoose.model('cadeaux', cadeauxSchema);


module.exports = cadeaux;