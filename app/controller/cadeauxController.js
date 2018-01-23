/**
 * Created by Antoine on 15/01/2018.
 */

var mongoose = require('mongoose');
var cadeaux_model = require('../models/cadeaux');

//sanitizes inputs against query selector injection attacks
var sanitize = require('mongo-sanitize');



/** Create a new survey in survey collection
 *
 * @param req
 * @param res
 */
exports.new_cadeau = function(req, res) {

        var cadeaux = {
            title: sanitize("Tee Shirt Nike"),
            description: sanitize("Le tee-shirt Nike Sportswear pour Homme est fabriqué dans un tissu 100 % coton pour un confort au quotidien et une résistance longue durée."),
            cadeaux_type: sanitize("1"),
            points: 165,
            url: "https://c.static-nike.com/a/images/t_PDP_1280_v1/f_auto/bmdaf9nwmdadb98xlkmq/tee-shirt-sb-logo-pour-olTWbPMg.jpg"        };
        new cadeaux_model(cadeaux).save(function (err, cadeaux) {
            if (err) {
                throw err;
            }
            var id_survey = cadeaux._id;
            //we get the Object_ID of the current survey
            cadeaux_model.findById(id_survey,function(err, cadeaux){
                if (err) {
                    // Note that this error doesn't mean nothing was found,
                    // it means the database had an error while searching, hence the 500 status
                    res.status(500).send(err);
                } else {
                    res.status(200).send(cadeaux[0]);
                }
            });
        });
};


exports.list_cadeaux_online = function(req, res){

        cadeaux_model.find({ points : { $lte: req.query.points}}, function (err, cadeaux) {
            if (err) {
                // Note that this error doesn't mean nothing was found,
                // it means the database had an error while searching, hence the 500 status
                res.status(500).send(err);
            }
                res.json(cadeaux);

        });

};



