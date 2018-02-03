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
        self.db.collection('stationPairs').find().toArray(function (err, stations) {
            res.header("Content-Type", "application/json");
            res.end(JSON.stringify(stations));
        });
    };

    //Retrieves station pair data from a single station. StationId comes from a parameter 'stationID' in the URI
    self.routes['getStationDepartures'] = function (req, res) {
        var stationID = parseInt(req.query.stationID);
        self.db.collection('stationPairs').find({"DEPARTURE_STATION": stationID}).sort({ DEPARTURES: -1 }).limit(10).toArray(function (err, names) {
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

    self.routes['getStationTimes'] = function (req, res) {
        var stationID = parseFloat(req.query.stationID);
        self.db.collection('stationTime').find({"STATION": stationID},{_id:0,STATION:0}).toArray(function (err, stations) {
            res.header("Content-Type", "application/json");
            res.end(JSON.stringify(stations));
        });
    };


    // When server is started, all collections are emptied and station data + test data appended
    self.db.open(function (err, db) {
        if (!err) {
            db.collection('stationLoc').remove()
            db.collection('stationPairs').remove()
            db.collection('stationTime').remove()

            fs.readFile('station_locations.json', 'utf8', function (err, data) {
                if (err) throw err;
                var json = JSON.parse(data);
                db.collection('stationLoc').insert(json, function (err, doc) {
                    if (err) throw err;
                });
                
            });
            fs.readFile('station_pair_data.json', 'utf8', function (err, data) {
                if (err) throw err;
                var json = JSON.parse(data);
                db.collection('stationPairs').insert(json, function (err, doc) {
                    if (err) throw err;
                });
            });
            fs.readFile('STATIONS_BY_TIME.json', 'utf8', function (err, data) {
                if (err) throw err;
                var json = JSON.parse(data);
                db.collection('stationTime').insert(json, function (err, doc) {
                    if (err) throw err;
                });
            });

        }
    });

    // Makes all files in /public visible for the user
    self.app.use(express.static(__dirname + '/public'));

    // Defines what to do when GET requests are coming in on various /somethingsomething addresses. Other addresses produce 404
    self.app.get('/dumpAll', self.routes['dumpAll']);
    self.app.get('/getStationDepartures', self.routes['getStationDepartures']);
    self.app.get('/getStationLocations', self.routes['getStationLocations']);
    self.app.get('/getStationTimes', self.routes['getStationTimes']);

    // Make app listen to a determined port
    self.app.listen(1337, () => console.log('App listening carefully on port 1337'));


};

// A instance of the whole App is created
var app = new App();
