

var lineGroup;
var line;

// Basic Leaflet set up. Basemap from the API of Digitransit
var map = L.map('map').setView([60.18, 24.93], 12);
var basemap = L.tileLayer('http://api.digitransit.fi/map/v1/{id}/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ',
    id: 'hsl-map'
}).addTo(map);


// Get stations locations from the server via GET. Call pinTheStations with the results
function getStationLocations(e) {
    url = "/getStationLocations";
    $.get(url, pinTheStations, "json");
}

// Make markers out of the station JSON data, add them to a layergroup and add the group to the map
function pinTheStations(stationJSON) {
    stationGroup = L.layerGroup()
    stationGroupDict = {}
    for (var i = 0; i < stationJSON.length; i++) {
        var station = stationJSON[i];
        stationGroupDict[station.ID] = [station.XCOORD, station.YCOORD];
        var stationMarker = L.circleMarker([station.YCOORD, station.XCOORD],
            {
                radius: 6,
                fillColor: "#05668D",
                nimi: station.Nimi,
                osoite: station.Osoite,
                ID: station.ID,
                isOpen: false
            }).on("click", getStationDepartures);;
        stationMarker.bindPopup("<b>NIMI: </b>" + station.Nimi + "<br>" + "<b>Osoite: </b>" + station.Osoite)
        stationGroup.addLayer(stationMarker);
    }
    stationGroup.addTo(map)
}

function getStationDepartures(e) {
    clickedStation = e.target;
    if (map.hasLayer(line)) {
        for (key in map['_layers']) {
            // console.log(map['_layers'][key])
            if (map['_layers'][key].options.snakingSpeed) {
                map.removeLayer(map['_layers'][key])
            }

        }

    }


    // console.log(clickedStation);
    clickedStation.options.isOpen = true
    station_ID = parseInt(clickedStation.options.ID)
    url = "/getSingleStationDepartures?stationID=" + station_ID;
    console.log(url)
    $.get(url, drawStationPairLines, "json");

}



function getLineWeight(departures) {
    switch (true) {
        case (departures <= 500):
            return 2
            break;
        case (departures > 500 && departures < 1500):
            return 5
            break;
        case (departures >= 1500):
            return 7
            break;
        default:
            alert("none");
            break;
    }
}

function drawStationPairLines(station_pair_JSON) {
    lineGroup = L.featureGroup()
    // console.log(station_pair_JSON)
    // console.log(station_pair_JSON)
    // console.log(stationGroupDict)
    departure_station_coord = stationGroupDict[station_pair_JSON[0].DEPARTURE_STATION]

    for (var i = 0; i < station_pair_JSON.length; i++) {
        return_station_coord = stationGroupDict[station_pair_JSON[i].RETURN_STATION]
        if (typeof (return_station_coord) == 'undefined') {
            console.log("STATION: " + station_pair_JSON[i].RETURN_STATION + " NOT FOUND")
        }
        line = L.polyline([new L.LatLng(departure_station_coord[1], departure_station_coord[0]), new L.LatLng(return_station_coord[1], return_station_coord[0])],
            {
                weight: getLineWeight(station_pair_JSON[i].DEPARTURES),
                snakingSpeed: 500,
                duration_mean: station_pair_JSON[i].DURATION_MEAN,
                distance_mean: station_pair_JSON[i].DISTANCE_MEAN,
                clickable: true

            }).addTo(map).bindPopup("<b>Mean duration:</b> " + parseFloat(station_pair_JSON[i].DURATION_MEAN).toFixed(2) + "<br>" + "<b>Mean distance: </b>" +parseFloat( station_pair_JSON[i].DISTANCE_MEAN).toFixed(2) ).snakeIn()

        line.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });


        // lineGroup.addLayer(line);
        // lineGroup.addTo(map).snakeIn();
    }
}

function highlightFeature(e) {
    var layer = e.target;
    this.openPopup()

    layer.setStyle({
        weight: 5,
        color: '#FF8000',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    var layer = e.target;
    this.closePopup()
    
        layer.setStyle({
            weight: 2,
            color: 'blue',
            dashArray: '',
            fillOpacity: 0.7
        });
}



// Call getStationLocations after map ready.
map.whenReady(getStationLocations);