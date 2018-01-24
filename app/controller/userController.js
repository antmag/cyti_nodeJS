 /**
 * Created by Antoine on 16/01/2018.
 */

var mongoose = require('mongoose');
var database = require('../../config/database');
var user_model = require('../models/schema_user');
var cadeaux_model = require('../models/cadeaux');
var survey_model = require('../models/survey');
var answer_user_model = require('../models/schema_answers_user');
var answer_model = require('../models/answer');
//sanitizes inputs against query selector injection attacks
var sanitize = require('mongo-sanitize');


/** Create a new survey in survey collection
 *
 * @param req
 * @param res
 */
exports.new_user = function(req, res) {

        var user = {
        	id_facebook: "idfacebook",
    		username: "username",
    		login: "login",
    		mdp: "mdp",
    		owner: 0,
    		points : "1050"
    	};
        new user_model(user).save(function (err, user) {    
            if (err) {
                throw err;
            }
            var id_user = user._id;
            //we get the Object_ID of the current survey
            user_model.findById(id_user,function(err, user){
                if (err) {
                    // Note that this error doesn't mean nothing was found,
                    // it means the database had an error while searching, hence the 500 status
                    res.status(500).send(err);
                } else {
                    res.status(200).send(user[0]);
                }
            });
        });
};


exports.list_users = function(req, res, next){

        user_model.find(function (err, user) {
            if (err) {
                // Note that this error doesn't mean nothing was found,
                // it means the database had an error while searching, hence the 500 status
                return next(err);
            }
                res.end(JSON.stringify(user));

        });

};


exports.remove_points = function(req, res){

        user_model.findByIdAndUpdate(req.query.id, { $set: {points : req.query.points}}, function (err) {
            if (err) {
                // Note that this error doesn't mean nothing was found,
                // it means the database had an error while searching, hence the 500 status
                res.status(500).send(err);
            }
        });

        cadeaux_model.find({ points : { $lte: req.query.points}}, function (err, cadeaux) {
            if (err) {
                // Note that this error doesn't mean nothing was found,
                // it means the database had an error while searching, hence the 500 status
                res.status(500).send(err);
            }
                res.json(cadeaux);

        });

};



exports.check_user = function(req, res, next){
    user_model.find({"id_facebook":req.body.id_facebook} ,function (err, user) {
            if (err) {
                // Note that this error doesn't mean nothing was found,
                // it means the database had an error while searching, hence the 500 status
                return next(err);
            }
            if(user[0] != null){
                console.log(user);
                console.log("id facebook " + req.body.id_facebook + " lien " + req.body.lien + " username " + req.body.username);
                res.json(user);
            }else{
                var user = {
                    id_facebook: req.body.id_facebook,
                    username: req.body.username,
                    login: "",
                    mdp: "",
                    owner: 0,
                    points : 0,
                    surveys: [],
                    url_fb_picture: req.body.url

                };
                new user_model(user).save(function (err, user) {    
                    if (err) {
                        throw err;
                    }
                    var id_user = user._id;
                    //we get the Object_ID of the current survey
                    user_model.findById(id_user,function(err, user){
                        if (err) {
                            // Note that this error doesn't mean nothing was found,
                            // it means the database had an error while searching, hence the 500 status
                            res.status(500).send(err);
                        } else {
                            var test=[];
                            test.push(JSON.stringify(user));
                            res.json([user]);
                        }
                    });
                });
            }

        });        

};

exports.updates_after_survey = function(req, res){


    answer_model.find({'id_survey': req.params.id_survey}, function(err, answers) {
        answers.forEach( function(answer, i){
            answer_user_model.find({'id_answer': answers[i]._id}).exec(function (err, results) {
            console.log("on passe ici : results length" + results.length);
            console.log('i ' + i);
            answer_model.findByIdAndUpdate(answers[i]._id,{
                $set: {value: results.length}
            }, {new: true}, function (err) {
                if (err) {
                    console.log("after answer_model.findByIdAndUpdate(answers[i]._id" + err);
                    return res.send(err);
                }
                else {
                    console.log('couting done');
                }
            });
        });
    });
    });

    survey_model.findByIdAndUpdate(req.params.id_survey, { $inc: { nb_answers: 1 }}, {new: true}, function(err, survey) {
        if (err){
          console.log("after increment " + err);
          return res.status(500).send(err);
        }
        else {
            console.log("nb_answers : " + survey.nb_answers);
            res.end("nb_answers increment done" + survey);
        }
    });

     survey_model.findById(req.params.id_survey, function(err, survey){
        if(err){
            console.log("after survey find by id " + err);
            return res.status(500).send(err);
        }
        else{
            var survey_points = survey.points;
            user_model.findById(req.body.id_user, function(err, user) {
                if (err) console.log("ici " +err);
                else {
                    var points_user = user.points + survey_points;
                    user_model.findByIdAndUpdate(req.body.id_user, {
                        $push: {surveys: req.params.id_survey},
                        $set: {points: points_user}
                    }, {new: true}, function (err, user) {
                        if (err){
                            console.log("là " + err);
                            return res.send(err);
                        }
                        else {
                            user_model.findById(req.body.id_user).populate({
                                path: "surveys", model: "survey"}).exec(function(err, user ) {
                                if (err) {
                                    console.log("wesh " + err);
                                    return res.send(err);
                                }
                                else {
                                var myObj, x;                                
                                myObj = {
                                    "surveys":user.surveys,
                                    "beauty":0,
                                    "sport":0,
                                    "shopping":0,
                                    "fashion":0,
                                    "total":0
                                };

                                user.surveys.map(function(item) { 
                                  switch(item.theme) {
                                        case "beauty":
                                            myObj.beauty = Number(myObj.beauty)+1;
                                            break;
                                        case "sport":
                                            myObj.sport = Number(myObj.sport)+1;
                                            break;
                                        case "shopping":
                                            myObj.shopping = Number(myObj.shopping)+1;
                                            break;
                                        case "fashion":
                                            myObj.fashion = Number(myObj.fashion)+1;
                                            break;
                                        default:
                                    }       
                                });
                                    myObj.total=Number(myObj.beauty)+Number(myObj.fashion)+Number(myObj.sport)+Number(myObj.shopping);
                                    res.json(myObj);
                                }


                            });
                        }
                    });
                }
            });
        }
    });


};


exports.list_surveys_completed = function(req, res){
    user_model.findById(req.query.id_user).populate({
        path: "surveys", model: "survey"}).exec(function(err, user ) {
        if (err) res.send(err);
        else {
        var myObj, x;
        
        myObj = {
            "surveys":user.surveys,
            "beauty":0,
            "sport":0,
            "shopping":0,
            "fashion":0,
            "total":0
        };

        user.surveys.map(function(item) { 
          switch(item.theme) {
                case "beauty":
                    myObj.beauty = Number(myObj.beauty)+1;
                    break;
                case "sport":
                    myObj.sport = Number(myObj.sport)+1;
                    break;
                case "shopping":
                    myObj.shopping = Number(myObj.shopping)+1;
                    break;
                case "fashion":
                    myObj.fashion = Number(myObj.fashion)+1;
                    break;
                default:
            }       
        });
            myObj.total=Number(myObj.beauty)+Number(myObj.fashion)+Number(myObj.sport)+Number(myObj.shopping);
            res.json(myObj);
        }


    });
};

