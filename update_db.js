var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');

MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', process.env.MONGODB_URI);

        // db.collection('stationLoc').remove()
        db.collection('stationPairs').remove()
        db.collection('stationDepartures').remove()
        db.collection('stationReturns').remove()
        // db.collection('stationTime').remove()

        // fs.readFile('station_locations.json', 'utf8', function (err, data) {
        //     if (err) throw err;
        //     var json = JSON.parse(data);
        //     db.collection('stationLoc').insert(json, function (err, doc) {
        //         if (err) throw err;
        //     });
        // });


        fs.readFile('STATIONS_PAIR_DATA_filtered_mini.json', 'utf8', function (err, data) {
            if (err) throw err;
            var json = JSON.parse(data);
            db.collection('stationDepartures').insert(json, function (err, doc) {
                if (err) throw err;
            });
        });


        fs.readFile('STATION_PAIR_DATA_RETURNS_filtered_mini.json', 'utf8', function (err, data) {
            if (err) throw err;
            var json = JSON.parse(data);
            db.collection('stationReturns').insert(json, function (err, doc) {
                if (err) throw err;
            });
        });


        // fs.readFile('STATIONS_BY_TIME.json', 'utf8', function (err, data) {
        //     if (err) throw err;
        //     var json = JSON.parse(data);
        //     db.collection('stationTime').insert(json, function (err, doc) {
        //         if (err) throw err;
        //     });
        // });


        // db.collection('stationLoc').count(function (err, count) { console.log('Station Locations: ' + count) })
        // db.collection('stationDepartures').count(function (err, count) { console.log('Station Departures: ' + count) })
        // db.collection('stationReturns').count(function (err, count) { console.log('Station Returns: ' + count) })
        // db.collection('stationTime').count(function (err, count) { console.log('Station Times: ' + count) })


        // db.close()

        setTimeout(function () {
            db.collection('stationLoc').count(function (err, count) { console.log('Station Locations: ' + count) })
            db.collection('stationDepartures').count(function (err, count) { console.log('Station Departures: ' + count) })
            db.collection('stationReturns').count(function (err, count) { console.log('Station Returns: ' + count) })
            db.collection('stationTime').count(function (err, count) { console.log('Station Times: ' + count) })
            setTimeout(function(){

                db.close()
            },5000)

        }, 20000);

    }
});
