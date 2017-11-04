
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
    stationUrl = "/getStationLocations";
    $.get(stationUrl, pinTheStations, "json");
}

// Make markers out of the station JSON data, add them to a layergroup and add the group to the map
function pinTheStations(stationJSON) {
    stationGroup = L.layerGroup()
    for (var i = 0; i < stationJSON.length; i++) {
        var station = stationJSON[i];
        var stationMarker = L.circleMarker([station.YCOORD, station.XCOORD],{radius:6,fillColor:"#05668D",nimi:station.Nimi,osoite:station.Osoite});
        stationMarker.bindPopup("<b>NIMI: </b>"+station.Nimi+"<br>"+"<b>Osoite: </b>"+ station.Osoite)
        stationGroup.addLayer(stationMarker);
    }
    stationGroup.addTo(map)
}

// Call getStationLocations after map ready.
map.whenReady(getStationLocations);