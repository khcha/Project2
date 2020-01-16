$(document).ready(function() {
    buildHistograms(2014);

    //Event listeners
    $('#years').change(function() {
        $('#graphs').hide();
        $('#gif').show();

        var year = $('#years').val();
        var topBottom = $('#topBottom').val();
        var limit = $('#limit').val();

        buildHistograms(year);
    });
});

//deal with async
var isMenDone = false;
var isWomenDone = false;

function checkDone() {
    if (isMenDone && isWomenDone) {
        $('#graphs').show();
        $('#gif').hide();

        //reset
        isWomenDone = false;
        isMenDone = false;
    }
}

function buildHistograms(year) {
    buildHistogram(year, "male");
    buildHistogram(year, "female");
}

function buildHistogram(year, male) {
    //For plot title
    var title = "Women";
    if (male == "male") {
        title = "Men";
    }

    $("#my_dataviz" + male).html("");

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 40, left: 70 },
        width = 1000 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;
    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz" + male)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    // get the data
    d3.json("/salaries/" + year + "/" + male).then(function(data) {
        console.log(data);
        var objs = Object.values(data);
        var basePay = [];
        var overtimePay = [];
        for (var i = 0; i < objs.length; i++) {
            basePay.push(objs[i].BasePay);
            overtimePay.push(objs[i].OvertimePay);
        }
        // X axis: scale and draw:
        var x = d3.scaleLinear()
            .domain([d3.min(overtimePay), d3.max(basePay)]) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        // set the parameters for the histogram
        var histogram = d3.histogram()
            .value(function(d) { return +d; }) // I need to give the vector of value
            .domain(x.domain()) // then the domain of the graphic
            .thresholds(x.ticks(40)); // then the numbers of bins
        // And apply twice this function to data to get the bins.
        var bins1 = histogram(basePay);
        var bins2 = histogram(overtimePay);
        // Y axis: scale and draw:
        var y = d3.scaleLinear()
            .range([height, 0]);
        y.domain([0, d3.max(bins1, function(d) { return d.length; })]); // d3.hist has to be called before the Y axis obviously
        svg.append("g")
            .call(d3.axisLeft(y));
        // append the bars for series 1
        svg.selectAll("rect")
            .data(bins1)
            .enter()
            .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#69b3a2")
            .style("opacity", 0.6)
            // append the bars for series 2
        svg.selectAll("rect2")
            .data(bins2)
            .enter()
            .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#404080")
            .style("opacity", 0.6)
            // Handmade legend
        svg.append("circle").attr("cx", 800).attr("cy", 30).attr("r", 6).style("fill", "#69b3a2")
        svg.append("circle").attr("cx", 800).attr("cy", 60).attr("r", 6).style("fill", "#404080")
        svg.append("text").attr("x", 820).attr("y", 30).text("Base Pay").style("font-size", "15px").attr("alignment-baseline", "middle")
        svg.append("text").attr("x", 820).attr("y", 60).text("Overtime Pay").style("font-size", "15px").attr("alignment-baseline", "middle")
        svg.append("text").attr("x", (width / 2)).attr("y", (margin.top / 10)).attr("text-anchor", "middle").classed("title", true).text("Density of " + title + " Base and Overtime Pay")
            // append y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -15 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "2em")
            .attr("value", "Density")
            .classed("active", true)
            .text("Density");
        svg.append("text")
            .attr("x", 400)
            .attr("y", 410)
            .attr("value", "Base and Overtime Pay") // value to grab for event listener
            .classed("active", true)
            .text("Base and Overtime Pay");

        if (male == "male") {
            isMenDone = true;
        } else {
            isWomenDone = true;
        }

        checkDone();
    });
}