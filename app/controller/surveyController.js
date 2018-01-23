/**
 * Created by Robin on 10/01/2018.
 */
var mongoose = require('mongoose');
var database = require('../../config/database');
var survey_model = require('../models/survey');
var question_model = require('../models/question');
var answer_model = require('../models/answer');
var user_model = require('../models/schema_user');
var fs = require('fs');
var http = require('http');
var https = require('https');


//sanitizes inputs against query selector injection attacks
var sanitize = require('mongo-sanitize');


exports.list_all = function(req, res){

    survey_model.find({}).populate({path: "questions", model: "question", populate: { path: 'answers',
        model: 'answer'}}).exec(function (err, surveys) {
        if(err){
            res.send(err);
        }
        else{
            res.json(surveys);
        }
    });
};

/** Front Side
 * Create a new survey in survey collection
 *
 * @param req
 * @param res
 */
exports.new_survey = function(req, res) {

    var picture = req.body.url;

    if(picture !== "" ){
        picture= 'public/images/' + sanitize(req.body.id_survey)  + "_" + Date.now() +'.jpg';
        download(req.body.url, "./" + picture , function(err){
            if (err) {
                console.error(err);
                return;
            }
            console.log('Download Done !');
        });
    }else{
        switch (req.body.theme) {
            case 'sport':
                picture = "public/images/theme_sport_default.jpg";
                break;
            case 'beauty':
                picture = "public/images/theme_beauty_default.jpg";
                break;
            case 'fashion':
                picture = "public/images/theme_fashion_default.jpg";
                break;
            case 'shopping':
                picture = "public/images/theme_shopping_default.jpg";
                break;
        }
    }

    function randomIntInc (low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }



    var survey = {
        _id: req.body.id_survey,
        title: sanitize(req.body.title),
        description: sanitize(req.body.description),
        survey_type: sanitize(req.body.survey_type),
        theme: sanitize(req.body.theme),
        status: "offline",
        points: randomIntInc(20,100),
        picture_url: "http://195.154.107.158:1337/" + picture,
        duration: ""
    };
    console.log(survey);
    new survey_model(survey).save(function (err) {
        if (err) {
            res.send(err);
        }
        else{
            survey_model.find({}).populate({path: "questions", model: "question", populate: { path: 'answers',
                model: 'answer'}}).exec(function (err, surveys) {
                if(err) res.send(err);
                else{
                    res.json(surveys);
                }
            });
        }
    });
};

/** Front side
 *
 * Update status survey in DB
 *
 * @param req
 * @param res
 */
exports.change_status_survey = function(req, res){

    survey_model.findById(req.body.id_survey,function(err, survey) {
        if (err) {
            // Note that this error doesn't mean nothing was found,
            // it means the database had an error while searching, hence the 500 status
            res.status(500).send(err);
        } else {
            if(survey.status === "offline") survey.status = "online";
            else survey.status = "offline";
            survey.save( function(err){
                if (err) {
                    res.send(err);
                }
                else{
                    survey_model.find({}).populate({path: "questions", model: "question", populate: { path: 'answers',
                        model: 'answer'}}).exec(function (err, surveys) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            res.json(surveys);
                        }
                    });
                }
            });
        }
    });
};



/** Application side
 *
 * List all surveys which are online
 *
 * @param req
 * @param res
 */
exports.list_surveys_online = function(req, res) {


    user_model.findById(req.body.id_user, function (err, user) {
        if (err) res.status(500).send(err);
        else {
            survey_model.find({"status": "online", "_id": { "$nin": user.surveys } }, function (err, survey) {
                if (err) {
                    // Note that this error doesn't mean nothing was found,
                    // it means the database had an error while searching, hence the 500 status
                    res.status(500).send(err);
                }
                else {
                    res.json(survey);
                }
            });
        }
    });


    /*survey_model.find({"status": "online"}, function (err, survey) {
        if (err) {
            // Note that this error doesn't mean nothing was found,
            // it means the database had an error while searching, hence the 500 status
            res.status(500).send(err);
        }
        else {
            res.json(survey);
        }
    });*/
};


/** Front side
 *
 * Delete a specified survey from its ID in BD
 * @param req
 * @param res
 */
exports.delete_survey = function(req, res){

        survey_model.findByIdAndRemove(req.body.id_survey,function(err) {
            if (err) {
                res.status(500).send(err);
            } else {
                question_model.remove({ id_survey: req.body.id_survey}, function(err) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        answer_model.remove({id_survey: req.body.id_survey}, function (err) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                survey_model.find({}).populate({
                                    path: "questions", model: "question", populate: {
                                        path: 'answers',
                                        model: 'answer'
                                    }
                                }).exec(function (err, surveys) {
                                    if (err) res.send(err);
                                    else {
                                        res.json(surveys);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
};


exports.update_survey = function(req, res){

    var modifications = {};

    // Check which parameters are set and add to object.
    // Indexes set to 'undefined' won't be included.
    modifications.title = req.body.title ?
        req.body.title: "undefined";

    modifications.description = req.body.description ?
        req.body.description: "undefined";

    modifications.survey_type = req.body.survey_type ?
        req.body.survey_type: "undefined";

    modifications.theme = req.body.theme ?
        req.body.theme: "undefined";

    survey_model.findByIdAndUpdate(req.body.id_survey, {
        $set: modifications}, {new: true}, function (err, survey) {
        if (err) res.send(err);
        else{
            console.log("new update : " + survey);
            survey_model.find({}).populate({
                path: "questions", model: "question", populate: {
                    path: 'answers',
                    model: 'answer'
                }
            }).exec(function (err, surveys) {
                if (err) res.send(err);
                else {
                    res.json(surveys);
                }
            });
        }
    });
};

exports.json_file_stats = function(req, res) {


        survey_model.findById(req.query.id_survey).select( '-title -description -survey_typ -theme ' +
            '-status -points -survey_type -duration').populate({
            path: "questions", model: "question",
            select: '-id_survey -position -txt -type -mandatory', populate: {
                path: 'answers',
                model: 'answer', select: ' -id_question -id_survey -position -txt'
            }
        }).exec(function (err, surveys) {
            if (err) {
                res.send(err);
            }
            else {
                res.json(surveys);
            }
        });
};

function download(url, dest, cb) {
    // on créé un stream d'écriture qui nous permettra
    // d'écrire au fur et à mesure que les données sont téléchargées
    console.log("before createWriteStream");
    const file = fs.createWriteStream(dest);
    var httpMethod;

    // afin d'utiliser le bon module on vérifie si notre url
    // utilise http ou https
    if (url.indexOf(('https://')) !== -1) httpMethod = https;
    else httpMethod = http;

    // on lance le téléchargement
    console.log("avant le telechargement");
    const request = httpMethod.get(url, function (response) {
        // on vérifie la validité du code de réponse HTTP
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }

        // écrit directement le fichier téléchargé
        response.pipe(file);

        // lorsque le téléchargement est terminé
        // on appelle le callback
        file.on('finish', function () {
            // close étant asynchrone,
            // le cb est appelé lorsque close a terminé
            file.close(cb);
        });
    });

    // check for request error too
    request.on('error', function (err) {
        fs.unlink(dest);
        cb(err.message);
    });

    // si on rencontre une erreur lors de l'écriture du fichier
    // on efface le fichier puis on passe l'erreur au callback
    file.on('error', function (err) {
        // on efface le fichier sans attendre son effacement
        // on ne vérifie pas non plus les erreur pour l'effacement
        fs.unlink(dest);
        cb(err.message);
    });
}


