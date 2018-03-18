var lineGroup;
var line;
var info_div

// Basic Leaflet set up. Basemap from the API of Digitransit
var map = L.map('map').setView([60.188, 24.97], 13);
var basemap = L.tileLayer('http://api.digitransit.fi/map/v1/{id}/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ',
    id: 'hsl-map'
}).addTo(map);

map.doubleClickZoom.disable();

function fillInfoDivAtStart() {
    createInfoDiv()
    var welcome_div = document.createElement("div")
    welcome_div.id = 'welcomeContainer'

    var credits_div = document.createElement("div")
    credits_div.id = 'creditsContainer'

    welcome_title = document.createElement("H1")
    welcome_title.id = 'infoDivHeader'
    welcome_title.innerHTML = 'Welcome!'

    welcome_text = document.createElement("p")
    welcome_text.id = 'infoDivText'
    welcome_text.innerHTML = "You've stumbled onto <b>Konkeli</b> - a map application visualising the spatial and temporal dimensions of the city bike system in Helsinki."
        + "<br><br>The system was composed of <b>140</b> stations and approximately <b>1380</b> bikes in 2017 and all together over <b>1,49</b> million departures were made. That is an average of <b>~6</b> departures per day per bike."
        + "<br><br><b>Click any station for more information! <br>Left click for <span style=color:#004080> departures</span>, right click (or long click) for <span style=color:#FF8000> returns</span></b>"

    credits = document.createElement("p")
    credits.id = 'creditsText'
    credits.innerHTML = "This application was made by <b>Johannes Nyman</b> in collobration with <a href=http://blogs.helsinki.fi/accessibility/>the Accessibility Research Group </a> of the University of Helsinki<br><b>More information & source code: </b><br><a href=https://github.com/nyjohannes/konkeli>https://github.com/nyjohannes/konkeli</a>"

    welcome_div.appendChild(welcome_title)
    welcome_div.appendChild(welcome_text)
    credits_div.appendChild(credits)
    info_div.appendChild(welcome_div)
    info_div.appendChild(credits_div)
}

function drawTimeGraph(station_times_url) {

    if ($(window).width() < 431) {
        var margin = { top: 30, right: 30, bottom: 30, left: 50 },
            width = 360 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;
    }

    else {
        var margin = { top: 30, right: 30, bottom: 30, left: 50 },
            width = 400 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;
    }

    var x = d3.scale.linear().range([0, width])
    var y = d3.scale.linear().range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(12)
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
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 300 300")
        .classed("svg-content", true);

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
            .style({ 'stroke': '#5b5b5b', 'fill': 'none', 'stroke-width': '1px' })
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .style({ 'stroke': '#5b5b5b', 'fill': 'none', 'stroke-width': '1px' })
            .call(yAxis);



        var time_serie = svg.selectAll(".timeSeries")
            .data(time_series)
            .enter().append("g")
            .attr("class", "timeSeries");

        var path = svg.selectAll(".timeSeries").append("path")
            .attr("class", "line")
            .attr("d", function (d) { return line(d.values); })
            .attr("data-legend", function (d) { return d.name })
            .style("stroke", function (d) {
                if (d.name == "DEPARTURES") { return "#004080" }
                else { return "#EE6C4D"; }
            });

        var totalLength = [path[0][0].getTotalLength(), path[0][1].getTotalLength()];

        d3.select(path[0][0])
            .attr("stroke-dasharray", totalLength[0] + " " + totalLength[0])
            .attr("stroke-dashoffset", totalLength[0])
            .transition()
            .duration(1000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);

        d3.select(path[0][1])
            .attr("stroke-dasharray", totalLength[1] + " " + totalLength[1])
            .attr("stroke-dashoffset", totalLength[1])
            .transition()
            .duration(1000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);


        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(20,30)")
            .style("font-size", "14px")
            .call(d3.legend)

    });

}

function getCircleSymbolSize(departures) {

    switch (true) {
        case (departures < 6700):
            return 10
        case (departures > 6700 && departures < 12000):
            return 15
        case (departures >= 12000):
            return 20
    }

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
        var textDiv = document.createElement('div');
        textDiv.id = 'textDiv'
        var circleSymbol = document.createElement('div')
        circleSymbol.className = 'circleSymbol'
        circleSymbol.id = this.options['stationID']
        circleSymbol.name = this.options['stationNimi']

        width = this.options['width']
        circleSymbol.style.width = width + "px"
        circleSymbol.style.height = width + "px"

        smallCircle = document.createElement('div')
        smallCircle.className = 'circleSymbolSmall'
        smallCircle.id = this.options['stationID']
        smallCircle.style.width = (width - (width / 4)-1) + "px"
        smallCircle.style.height = (width - (width / 4)-1) + "px"

        textDiv.textContent = this.options['number'] || '';
        circleSymbol.appendChild(smallCircle)
        div.appendChild(circleSymbol)
        div.appendChild(textDiv)

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
        stationGroupDict[station.ID] = [station.XCOORD, station.YCOORD, station.NIMI, station.DEPARTURES, station.RETURNS, station.SIZE];

        var stationMarker = L.marker([station.YCOORD, station.XCOORD],
            {
                icon: new L.NumberedDivIcon({ stationNimi: station.NIMI, stationID: station.ID, number: station.DEPARTURES, width: getCircleSymbolSize(station.DEPARTURES) }),
                NIMI: station.NIMI,
                ID: station.ID,
                DEPARTURES: station.DEPARTURES,
                RETURNS: station.RETURNS,
                SIZE: 0
            }
        )

        stationGroup.addLayer(stationMarker);
    }
    stationGroup.addTo(map)

}

function emptyInfoDiv() {
    close_button = document.getElementById('closeButton')
    info_div.innerHTML = "";
    info_div.appendChild(close_button)

}

function createInfoDiv() {
    info_div = document.createElement('div')
    info_div.id = 'infoDiv'

    if ($(window).width() < 431) {
        info_div.style.width = '350px'
    } else {
        info_div.style.width = '400px'
    }

    var close_button = document.createElement('button')
    close_button.id = 'closeButton'
    close_button.innerHTML = '<b>X</b>'
    close_button.onclick = function () {
        this.parentNode.parentNode
            .removeChild(this.parentNode);
        return false;
    };

    info_div.appendChild(close_button)
    document.body.appendChild(info_div);
}

function iClickedOnAStation(station_ID, leftOrRight) {

    if (!document.getElementById("infoDiv")) {
        createInfoDiv()
    }
    else { emptyInfoDiv() }

    graph_container = document.createElement('div')
    graph_container.id = 'graphContainer'
    stats_container = document.createElement('div')
    stats_container.id = 'statsContainer'
    station_pair_container = document.createElement('div')
    station_pair_container.id = 'stationPairContainer'
    station_title = document.createElement('H1')
    station_title.id = 'infoDivHeader'
    // console.log(e.target)
    // console.log(stationGroupDict[station_ID][2])
    station_title.innerHTML = stationGroupDict[station_ID][2]

    info_div.appendChild(station_title)
    info_div.appendChild(graph_container)
    info_div.appendChild(stats_container)
    info_div.appendChild(station_pair_container)


    if (map.hasLayer(line)) {
        for (key in map['_layers']) {
            // console.log(map['_layers'][key].options)
            if (map['_layers'][key].options.weight) {
                map.removeLayer(map['_layers'][key])
            }
        }
    }

    station_departures_URL = "/getStationDepartures?stationID=" + station_ID;
    station_returns_URL = "/getStationReturns?stationID=" + station_ID;
    station_times_url = "/getStationTimes?stationID=" + station_ID

    drawTimeGraph(station_times_url)

    if (leftOrRight == 'right') {
        $.getJSON(station_returns_URL, function (data) { setTimeout(function () { drawStationPairLinesToStation(data); createStationPairTable(data, "right") }, 200) });

    }
    else {
        $.getJSON(station_departures_URL, function (data) { setTimeout(function () { drawStationPairLinesFromStation(data); createStationPairTable(data, "left") }, 200) });

    }

    createStatTextLine(stats_container, "Departures: ", stationGroupDict[station_ID][3])
    createStatTextLine(stats_container, "Returns: ", stationGroupDict[station_ID][4])
    // createStatTextLine(stats_container, "Station size: ", stationGroupDict[station_ID][5])
}

function createStationPairTable(data, leftOrRightClick) {

    station_pair_container = document.getElementById("stationPairContainer");
    station_pair_container.innerHTML = ""
    // console.log(station_pair_container.childElementCount)

    // if (station_pair_container.childElementCount >= 2) { break; }
    var title = document.createElement("H1")
    title.id = "infoDivHeader"

    if (leftOrRightClick == 'left') {
        title.innerHTML = "Top 10 return stations";
        var col = ["RETURN_STATION", "DEPARTURES", "DISTANCE_MEAN", "DURATION_MEAN"];
    }

    else {
        title.innerHTML = "Top 10 departure stations";
        var col = ["DEPARTURE_STATION", "RETURNS", "DISTANCE_MEAN", "DURATION_MEAN"];
    }

    var better_cols = ["STATION", "RETURNS", "DISTANCE (MEAN)", "DURATION (MEAN)"];
    station_pair_container.appendChild(title)


    // console.log(col)
    var table = document.createElement("table");
    table.id = "stationPairTable"
    var tr = table.insertRow(-1);

    for (var i = 0; i < better_cols.length; i++) {
        var th = document.createElement("th");      // TABLE HEADER.
        th.innerHTML = better_cols[i];
        tr.appendChild(th);
    }
    for (var i = 0; i < data.length; i++) {

        tr = table.insertRow(-1);

        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);

            value = data[i][col[j]]
            if (col[j] == "DISTANCE_MEAN") { value = Math.round(value) + " m" }
            if (col[j] == "DURATION_MEAN") { value = Math.round(value / 60) + " min" }
            if (col[j] == "RETURN_STATION" | col[j] == "DEPARTURE_STATION") { value = stationGroupDict[data[i][col[j]]].slice(2, 3) }
            tabCell.innerHTML = value

        }
    }

    station_pair_container.appendChild(table)


}

function createStatTextLine(div, leftText, rightText) {

    var left = document.createElement("P");
    left.id = "statLeftText"
    var t = document.createTextNode(leftText);
    left.appendChild(t)

    var right = document.createElement("P")
    right.id = "statRightText"
    var t = document.createTextNode(rightText);
    right.appendChild(t)

    div.appendChild(left);
    div.appendChild(right);

}

function getLineWeight(amount) {
    switch (true) {
        case (amount <= 500):
            return 2
        case (amount > 500 && amount < 1000):
            return 4
        case (amount >= 1000 && amount < 1500):
            return 7
        case (amount >= 1500):
            return 10
        default:
            break;
    }
}

function drawStationPairLinesFromStation(station_pair_JSON) {
    lineGroup = L.featureGroup()
    // console.log(station_pair_JSON)
    // console.log(stationGroupDict)
    departure_station_coord = stationGroupDict[station_pair_JSON[0].DEPARTURE_STATION].slice(0, 2)

    for (var i = 0; i < station_pair_JSON.length; i++) {
        return_station_coord = stationGroupDict[station_pair_JSON[i].RETURN_STATION].slice(0, 2)
        if (typeof (return_station_coord) == 'undefined') {
            console.log("STATION: " + station_pair_JSON[i].RETURN_STATION + " NOT FOUND")
        }
        line = L.polyline([new L.LatLng(departure_station_coord[1], departure_station_coord[0]), new L.LatLng(return_station_coord[1], return_station_coord[0])],
            {
                color: '#004080',
                weight: getLineWeight(station_pair_JSON[i].DEPARTURES),
                // snakingSpeed: 400,
                duration_mean: station_pair_JSON[i].DURATION_MEAN,
                distance_mean: station_pair_JSON[i].DISTANCE_MEAN

            }).addTo(map)

        // .addTo(map).snakeIn()
    }


}

function drawStationPairLinesToStation(station_pair_JSON) {
    lineGroup = L.featureGroup()

    return_station_coord = stationGroupDict[station_pair_JSON[0].RETURN_STATION].slice(0, 2)

    for (var i = 0; i < station_pair_JSON.length; i++) {
        departure_station_coord = stationGroupDict[station_pair_JSON[i].DEPARTURE_STATION].slice(0, 2)
        if (typeof (return_station_coord) == 'undefined') {

        }
        // console.log(departure_station_coord[1], departure_station_coord[0],return_station_coord[1], return_station_coord[0])

        line = L.polyline([new L.LatLng(departure_station_coord[1], departure_station_coord[0]), new L.LatLng(return_station_coord[1], return_station_coord[0])],
            {
                color: '#FF8000',
                weight: getLineWeight(station_pair_JSON[i].RETURNS),
                duration_mean: station_pair_JSON[i].DURATION_MEAN,
                distance_mean: station_pair_JSON[i].DISTANCE_MEAN

            }).addTo(map)
    }
}

// Call getStationLocations after map ready.
map.whenReady(getStationLocations);

fillInfoDivAtStart()

function addEventListenerToStation() {
    var station_symbols = document.getElementsByClassName("leaflet-div-icon");
    for (i = 0; i < station_symbols.length; i++) {
        station_symbols[i].addEventListener("mousedown", tapOrClickStart, false);
        station_symbols[i].addEventListener("touchstart", tapOrClickStart, false);
        station_symbols[i].addEventListener("mouseup", tapOrClickEnd, false);
        station_symbols[i].addEventListener("touchend", tapOrClickEnd, false);
    }
}

var mousedown;
function tapOrClickStart(event) {
    mousedown = Date.now();
    event.preventDefault();
    return false;
}

function tapOrClickEnd(evt) {
    // console.log(evt)
    var elapsed = Date.now() - mousedown;
    mousedown = undefined;
    target = evt.target || evt.srcElement;
    // console.log(elapsed)

    if (evt.which == 3) {
        if (target.className == "circleSymbol" || target.className == 'circleSymbolSmall') {
            // console.log("Klikkasit oikealla napilla asemaa " + evt.path[1].id);
            iClickedOnAStation(target.id, "right")
            return;
        }
    }

    if (elapsed >= 1000) {
        if (target.className == "circleSymbol" || target.className == 'circleSymbolSmall') {

            iClickedOnAStation(target.id, "right")
            return;
        }
    }

    else {
        if (target.className == "circleSymbol" || target.className == 'circleSymbolSmall') {
            // console.log("Klikkasit vasemmalla napilla asemaa " + evt.path[1].id);
            iClickedOnAStation(target.id, "left")
            return;
        }
    }

    evt.preventDefault();
    return false;
}

window.addEventListener("load", function () {
    addEventListenerToStation();
});
