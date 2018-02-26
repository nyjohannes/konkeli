var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');

MongoClient.connect(process.env.MONGODB_URI, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', process.env.MONGODB_URI);

        // db.collection('stationLoc').remove()
        // db.collection('stationPairs').remove()
        // db.collection('stationTime').remove()

        // fs.readFile('station_locations.json', 'utf8', function (err, data) {
        //     if (err) throw err;
        //     var json = JSON.parse(data);
        //     db.collection('stationLoc').insert(json, function (err, doc) {
        //         if (err) throw err;
        //     });
        // });
        // fs.readFile('STATIONS_PAIR_DATA_filtered_mini.json', 'utf8', function (err, data) {
        //     if (err) throw err;
        //     var json = JSON.parse(data);
        //     db.collection('stationPairs').insert(json, function (err, doc) {
        //         if (err) throw err;
        //     });
        // });
        // fs.readFile('STATIONS_BY_TIME.json', 'utf8', function (err, data) {
        //     if (err) throw err;
        //     var json = JSON.parse(data);
        //     db.collection('stationTime').insert(json, function (err, doc) {
        //         if (err) throw err;
        //     });
        // });
        db.collection('stationLoc').count(function (err, count) { console.log('Station Locations: ' + count) })
        db.collection('stationPairs').count(function (err, count) { console.log('Station Pairs: ' + count) })
        db.collection('stationTime').count(function (err, count) { console.log('Station Times: ' + count) })
        db.close()

        // setTimeout(function () {
            // console.log('Data inserted. Stations: ' + db.collection('stationLoc').count() + ', StationPairs: ' + db.collection('stationPairs').count() + ', StationTimes: '
            //     + db.collection('stationTime').count())
            // db.collection('stationPairs').stats(function (err, stats) { console.log(stats); db.close() })
        //     db.collection('stationLoc').count(function (err, count) { console.log('Station Locations: ' + count) })
        //     db.collection('stationPairs').count(function (err, count) { console.log('Station Pairs: ' + count);db.close() })
        //     db.collection('stationTime').count(function (err, count) { console.log('Station Times: ' + count) })
            
        // }, 20000);

    }
});
