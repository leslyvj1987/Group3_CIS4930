require('dotenv').config();
var express = require("express");
var bodyParser = require("body-parser");

var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID;

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.post('/update', function (req, res) {

    if (req.body._id === undefined || req.body.availability === undefined) { return res.status(404).send("Invalid input"); }

    sendToDB(req.body._id, req.body.availability)
    .then(function(message) {
        console.log(message);
        return res.send(message);
    }).catch(function(err) {
        console.error(err);
    })
});

app.get('*', function(req, res) {
    console.log("Bad connection");
    res.status(404).send("You should not be connecting to this device like this.");
});

app.listen("8080");

console.log("server listening on: http://localhost:8080");

var sendToDB = function(_id, _availability) {

    return new Promise(function(resolve, reject) {
        MongoClient.connect(process.env.MONGODB, function (err, db) {
          if (err) throw err;

          var newValues = {$set: {availability:_availability}};

          db.collection('maps').updateOne({"_id":ObjectID(_id)}, newValues, function(err, result) {
            if (err) throw err;
          });

          db.close();
        });

        resolve("Updated availability of " + _id + " to " + _availability);

    });
}