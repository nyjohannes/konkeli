#!/bin/env node
var express = require('express');
var fs = require('fs');
var mongo = require('mongodb');

var App = function () {

    var self = this;
    self.app = express();

    // Serve up content from public directory
    self.app.use(express.static(__dirname + '/public'));
    self.app.get('/', (req,res) => res.send('Here be a very nice map'));
    self.app.listen(3000,() => console.log('App listenting carefully on port 3000'));


};

var app = new App();




// var App = function () {

//     // Scope
//     var self = this;

    

//     var Server = mongo.Server;
//     var Db = mongo.Db;

//     var dbServer = new Server('localhost', 27017, { auto_reconnect: true });
//     var db = new Db('exampleDb', server);

//     self.port = 3000;

//     self.routes['dumpAllStationData'] = function (req, res) {
//         // self.db.collection('lightning').find().toArray(function (err, names) {
//         //     res.header("Content-Type:", "application/json");
//         //     res.end(JSON.stringify(names));
//         // });
//         res.send('Hello World, here be all station data')
//     };

//     self.routes = {};

//     // self.routes['within'] = function (req, res) {
//     //     var lat1 = parseFloat(req.query.lat1);
//     //     var lon1 = parseFloat(req.query.lon1);
//     //     var lat2 = parseFloat(req.query.lat2);
//     //     var lon2 = parseFloat(req.query.lon2);

//     //     self.db.collection('lightning').find({ "pos": { $geoWithin: { $box: [[lon2, lat2], [lon1, lat1]] } }, cloud_indicator: 0 }).toArray(function (err, names) {
//     //         res.header("Content-Type:", "application/json");
//     //         res.end(JSON.stringify(names));
//     //     });
//     // };

//     // self.routes['testData'] = function (req, res) {
//     //     var lat1 = parseFloat(req.query.lat1);
//     //     var lon1 = parseFloat(req.query.lon1);
//     //     var lat2 = parseFloat(req.query.lat2);
//     //     var lon2 = parseFloat(req.query.lon2);

//     //     self.db.collection('testUkkone').find({ "pos": { $geoWithin: { $box: [[lon2, lat2], [lon1, lat1]] } }, cloud_indicator: 0 }).toArray(function (err, names) {
//     //         res.header("Content-Type:", "application/json");
//     //         res.end(JSON.stringify(names));
//     //     });
//     // };

//     // self.routes['nearbyStrikes'] = function (req, res) {
//     //     var lat1 = parseFloat(req.query.lat1);
//     //     var lon1 = parseFloat(req.query.lon1);
//     //     var lat2 = parseFloat(req.query.lat2);
//     //     var lon2 = parseFloat(req.query.lon2);

//     //     self.db.collection('testUkkone').find({ "pos": { $geoWithin: { $box: [[lon2, lat2], [lon1, lat1]] } }, cloud_indicator: 0 }).toArray(function (err, names) {
//     //         res.header("Content-Type:", "application/json");
//     //         res.end(JSON.stringify(names));
//     //     });
//     // };

//     self.app = express();
//     self.app.use(express.compress());

//     // Serve up content from public directory
//     self.app.use(express.static(__dirname + '/public'));


//     //This uses the Connect frameworks body parser to parse the body of the post request
//     // self.app.configure(function () {
//     //     self.app.use(express.bodyParser());
//     //     self.app.use(express.methodOverride());
//     //     self.app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
//     // });

//     self.app.get('/dumpAllStationData', self.routes['dumpALlStationData']);
//     // self.app.get('/ws/strikes/within', redirectSec, self.routes['within']);
//     // self.app.get('/testData', redirectSec, self.routes['testData']);
//     // self.app.get('/nearbyStrikes', redirectSec, self.routes['nearbySTrikes']);

//     db.open(function (err, db) {
//         if (!err) {
//             console.log("We are connected");
//         };
//     });

//     self.startServer = function () {
//         self.app.listen(self.port, function () {
//             console.log('%s: Node server started on %s:%d ...', Date(Date.now()), self.port);
//         });
//     };

//     ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'].forEach(self.terminatorSetup);


// };

// //make a new express app
// var app = new App();

// //call the connectDb function and pass in the start server command
// app.connectDb(app.startServer);

