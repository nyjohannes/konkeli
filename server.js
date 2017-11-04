#!/bin/env node
var express = require('express');
var mongo = require('mongodb');
var fs = require('fs');

var App = function () {


    var self = this;
    self.app = express();
    self.routes = {};

    // Mongo DB setup 
    var Server = mongo.Server;
    var Db = mongo.Db;
    self.server = new Server('localhost', 27017, { auto_reconnect: true });
    self.db = new Db('exampleDb', self.server);


    //Retrieves all station pair data from DB and dumps it to /dumpAll as JSON
    self.routes['dumpAll'] = function (req, res) {
        self.db.collection('testData').find().toArray(function (err, stations) {
            res.header("Content-Type", "application/json");
            res.end(JSON.stringify(stations));
        });
    };

    //Retrieves station pair data from a single station. StationId comes from a parameter 'stationID' in the URI
    self.routes['getSingleStationDepartures'] = function (req, res) {
        var stationID = parseFloat(req.query.stationID);
        self.db.collection('testData').find({ "start_ID": stationID }).toArray(function (err, names) {
            res.header("Content-Type", "application/json");
            res.end(JSON.stringify(names));
        });
    };

    //Retrieves all station locations from a different collection in the db
    self.routes['getStationLocations'] = function (req, res) {
        var stationID = parseFloat(req.query.stationID);
        self.db.collection('stationLoc').find().toArray(function (err, stations) {
            res.header("Content-Type", "application/json");
            res.end(JSON.stringify(stations));
        });
    };

    // When server is started, all collections are emptied and station data + test data appended
    self.db.open(function (err, db) {
        if (!err) {
            db.collection('stationLoc').remove()
            db.collection('testData').remove()
            fs.readFile('stationLocations.json', 'utf8', function (err, data) {
                if (err) throw err;
                var json = JSON.parse(data);
                db.collection('stationLoc').insert(json, function (err, doc) {
                    if (err) throw err;
                });
            });
            for (var i = 1; i <= 25; i++) {
                db.collection('testData').insert({ start_ID: Math.floor(Math.random() * 25), end_ID: Math.floor(Math.random() * 25) })
                db.collection('testData').insert({ start_ID: 666, end_ID: Math.floor(Math.random() * 25) })

            }
        }
    });

    // Makes all files in /public visible for the user
    self.app.use(express.static(__dirname + '/public'));

    // Defines what to do when GET requests are coming in on various /somethingsomething addresses. Other addresses produce 404
    self.app.get('/dumpAll', self.routes['dumpAll']);
    self.app.get('/getSingleStationDepartures', self.routes['getSingleStationDepartures']);
    self.app.get('/getStationLocations', self.routes['getStationLocations']);

    // Make app listen to a determined port
    self.app.listen(1337, () => console.log('App listening carefully on port 1337'));


};

// A instance of the whole App is created
var app = new App();
