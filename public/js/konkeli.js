var lineGroup;
var line;

// Basic Leaflet set up. Basemap from the API of Digitransit
var map = L.map('map').setView([60.18, 24.93], 13);
var basemap = L.tileLayer('http://api.digitransit.fi/map/v1/{id}/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ',
    id: 'hsl-map'
}).addTo(map);


function drawTimeGraph(station_times_url) {

    document.getElementById("graphContainer").innerHTML = "";

    var margin = { top: 30, right: 30, bottom: 30, left: 50 },
        width = 400 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var x = d3.scale.linear().range([0, width])
    var y = d3.scale.linear().range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(24)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(5)
        .orient("left");

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function (d) { return x(d.TIME); })
        .y(function (d) { return y(d.AMOUNT); });


    var svg = d3.select("#graphContainer").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json(station_times_url, function (error, data) {
        color.domain(d3.keys(data[0]).filter(function (key) { return key !== "TIME"; }));


        var time_series = color.domain().map(function (name) {
            return {
                name: name,
                values: data.map(function (d) {
                    return { TIME: d.TIME, AMOUNT: +d[name] };
                })
            };
        });

        x.domain([0, 24])

        y.domain([0, d3.max(time_series, function (c) { return d3.max(c.values, function (v) { return v.AMOUNT; }); })
        ]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);


        var time_serie = svg.selectAll(".timeSeries")
            .data(time_series)
            .enter().append("g")
            .attr("class", "timeSeries");



        var path = svg.selectAll(".timeSeries").append("path")
            .attr("class", "line")
            .attr("d", function (d) { return line(d.values); })
            .style("stroke", function (d) {
                if (d.name == "DEPARTURES") { return "rgb(000,255,000)" }
                else { return "#000"; }
            });

        var totalLength = [path[0][0].getTotalLength(), path[0][1].getTotalLength()];


        d3.select(path[0][0])
            .attr("stroke-dasharray", totalLength[0] + " " + totalLength[0])
            .attr("stroke-dashoffset", totalLength[0])
            .transition()
            .duration(500)
            .ease("linear")
            .attr("stroke-dashoffset", 0);

        d3.select(path[0][1])
            .attr("stroke-dasharray", totalLength[1] + " " + totalLength[1])
            .attr("stroke-dashoffset", totalLength[1])
            .transition()
            .duration(500)
            .ease("linear")
            .attr("stroke-dashoffset", 0);

    });

}

// Get stations locations from the server via GET. Call pinTheStations with the results
function getStationLocations(e) {
    url = "/getStationLocations";
    $.get(url, pinTheStations, "json");
}

L.NumberedDivIcon = L.Icon.extend({
    options: {
        number: '',
        shadowUrl: null,
        className: 'leaflet-div-icon'
    },

    createIcon: function () {
        var div = document.createElement('div');
        var square = document.createElement('div');

        square.setAttribute("class", "square");

        square.innerHTML = this.options['number'] || '';

        div.style.width = this.options['width'] + "px";
        div.style.height = this.options['width'] + "px";
        div.style.top = "-" + this.options['width'] / 2 + "px";
        div.style.left = "-" + this.options['width'] / 2 + "px";
        div.style.lineHeight = this.options['width'] + "px";

        div.appendChild(square);

        this._setIconStyles(div, 'icon');
        return div;
    },

    //you could change this to add a shadow like in the normal marker if you really wanted
    createShadow: function () {
        return null;
    }
});


// Make markers out of the station JSON data, add them to a layergroup and add the group to the map
function pinTheStations(stationJSON) {
    stationGroup = L.layerGroup()
    stationGroupDict = {}
    for (var i = 0; i < stationJSON.length; i++) {
        var station = stationJSON[i];
        stationGroupDict[station.ID] = [station.XCOORD, station.YCOORD];

        var stationMarker = L.marker([station.YCOORD, station.XCOORD],
            {
                icon: new L.NumberedDivIcon({ number: station.DEPARTURES, width: (station.DEPARTURES / 1000) }),
                nimi: station.Nimi,
                ID: station.ID,
                DEPARTURES: station.DEPARTURES
            }
        ).on("click", getStationDepartures);

        stationMarker.bindPopup("<b>NIMI: </b>" + station.Nimi + "<br>" + "<b>Departures: </b>" + station.DEPARTURES);

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

    clickedStation.options.isOpen = true
    station_ID = parseInt(clickedStation.options.ID)
    station_pair_URL = "/getStationDepartures?stationID=" + station_ID;
    station_times_url = "/getStationTimes?stationID=" + station_ID

    console.log(station_times_url)
    $.get(station_pair_URL, drawStationPairLines, "json");
    // $.get(station_departure_times_url, drawDepartureTimeGraph, "json");
    drawTimeGraph(station_times_url)

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

            }).addTo(map).bindPopup("<b>Mean duration:</b> " + parseFloat(station_pair_JSON[i].DURATION_MEAN).toFixed(2) + "<br>" + "<b>Mean distance: </b>" + parseFloat(station_pair_JSON[i].DISTANCE_MEAN).toFixed(2)).snakeIn()

        line.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });

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