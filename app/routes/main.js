/**
 * Created by Robin on 08/01/2018.
 */

var express = require('express');
var app = express();
var router = express.Router();
var path = require("path");
var bodyParser = require('body-parser');
var survey_controller = require('../controller/surveyController');
var question_answer_controller = require('../controller/question_answerController');
var http = require("http");
var server = http.createServer(app);// Creation du serveur web


//Body parser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());



// ## CORS middleware
//
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
        res.send(200);
    }
    else {
        next();
    }
};
app.use(allowCrossDomain);

app.use("/index", express.static(path.join(__dirname, "../../public")));

// middleware that is specific to this router
app.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

// Add a new survey
app.post('/', survey_controller.new_survey);

//List all surveys with questions and answers for a specific user
app.get('/', survey_controller.list_all);

// Add a new question with its respective answers
app.post('/survey/add_question',question_answer_controller.add_question_with_answers);

//Update the status of a targeted survey
app.post('/survey/change_status', survey_controller.change_status_survey);

//Delete a targeted survey
app.delete('/survey/delete', survey_controller.delete_survey);

//Delete a specified question with its answers
app.delete('/survey/delete_question', question_answer_controller.delete_question);

//Update a survey
app.post('/survey/update', survey_controller.update_survey);

app.get('/stats', survey_controller.json_file_stats);

module.exports = app;