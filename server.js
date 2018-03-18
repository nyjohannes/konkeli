var express = require('express')
var app = express()
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var appDB


app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.use('/scripts', express.static(__dirname + '/node_modules/leaflet/dist/'));
app.use('/scripts', express.static(__dirname + '/node_modules/d3/'));
app.use('/scripts', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/scripts', express.static(__dirname + '/node_modules/d3-legend/'));
app.use('/scripts', express.static(__dirname + '/node_modules/jquery-ui/'));

routes = {};

MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', process.env.MONGODB_URI);
    appDB = db
  }
});


//Retrieves station pair data from a single station. StationId comes from a parameter 'stationID' in the URI
routes['getStationDepartures'] = function (req, res) {
  var stationID = parseInt(req.query.stationID);
  appDB.collection('stationDepartures').find({ "DEPARTURE_STATION": stationID }).sort({ DEPARTURES: -1 }).toArray(function (err, names) {
    res.header("Content-Type", "application/json");
    res.end(JSON.stringify(names));
  });
};

routes['getStationReturns'] = function (req, res) {
  var stationID = parseInt(req.query.stationID);
  appDB.collection('stationReturns').find({ "RETURN_STATION": stationID }).sort({RETURNS: -1 }).toArray(function (err, names) {
    res.header("Content-Type", "application/json");
    res.end(JSON.stringify(names));
  });
};

//Retrieves all station locations from a different collection in the db
routes['getStationLocations'] = function (req, res) {
  var stationID = parseFloat(req.query.stationID);
  appDB.collection('stationLoc').find().toArray(function (err, stations) {
    res.header("Content-Type", "application/json");
    res.end(JSON.stringify(stations));
  });
};

routes['getStationTimes'] = function (req, res) {
  var stationID = parseFloat(req.query.stationID);
  appDB.collection('stationTime').find({ "DEPARTURE_STATION": stationID }, { _id: 0, DEPARTURE_STATION: 0 }).sort({ TIME: 1 }).toArray(function (err, stations) {
    res.header("Content-Type", "application/json");
    res.end(JSON.stringify(stations));
  });
};

routes['getAllStationTimes'] = function (req, res) {
  var stationID = parseFloat(req.query.stationID);
  appDB.collection('stationTime').find().toArray(function (err, stations) {
    res.header("Content-Type", "application/json");
    res.end(JSON.stringify(stations));
  });
};


app.get('/getStationDepartures', routes['getStationDepartures']);
app.get('/getStationReturns', routes['getStationReturns']);
app.get('/getStationLocations', routes['getStationLocations']);
app.get('/getStationTimes', routes['getStationTimes']);
app.get('/getAllStationTimes', routes['getAllStationTimes']);


app.listen(process.env.PORT || 5000)