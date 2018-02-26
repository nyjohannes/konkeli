

var width = window.innerWidth,
    height = window.innerHeight

var svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

var kunnat = svg.append('g')

var asemat = svg.append('g')

var projection = d3.geoTransverseMercator()
    .scale(500000)
    .rotate([-24.9, 0])
    .center([0, 60.18])
    .translate([width / 2, height / 2])


var geopath = d3.geoPath()
    .projection(projection)


d3.json("kunnat.json", function (error, data) {

    kunnat.selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('fill', '#ccc')
        .attr('d', geopath)

});

d3.json("https://konkeli.herokuapp.com/getStationLocations", function (error, data) {
    coord_array = []
    // console.log(data)

    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        coord_array.push([obj.XCOORD, obj.YCOORD])
    }

    console.log(coord_array)

    asemat.selectAll('path')
        .data(coord_array)
        .enter()
        .append('circle')
		.attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
		.attr("cy", function (d) { return projection(d)[1]; })
		.attr("r", "3px")
		.attr("fill", "red")
});