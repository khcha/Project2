$(document).ready(function() {
    buildJobTitleChart(2014, "Top", 10);

    //Event listeners
    $('#years').change(function() {
        $('#graphs').hide();
        $('#gif').show();

        var year = $('#years').val();
        var topBottom = $('#topBottom').val();
        var limit = $('#limit').val();

        buildJobTitleChart(year, topBottom, limit);
    });
    $('#topBottom').change(function() {
        $('#graphs').hide();
        $('#gif').show();

        var year = $('#years').val();
        var topBottom = $('#topBottom').val();
        var limit = $('#limit').val();

        buildJobTitleChart(year, topBottom, limit);
    });
    $('#limit').change(function() {
        $('#graphs').hide();
        $('#gif').show();

        var year = $('#years').val();
        var topBottom = $('#topBottom').val();
        var limit = $('#limit').val();

        buildJobTitleChart(year, topBottom, limit);
    });
});

function buildJobTitleChart(year, topBottom, limit) {
    d3.json(`/jobTitles/${year}/${topBottom}`).then((data) => {

        var height = 45;
        if (limit == 5) {
            height = 75;
        }

        var data_men = JSON.parse(data.men);
        var data_women = JSON.parse(data.women);

        // Sort the data array using the Salary
        data_men = Object.entries(data_men).sort(function(a, b) {
            return parseFloat(b.TotalPay) - parseFloat(a.TotalPay);
        });
        data_women = Object.entries(data_women).sort(function(a, b) {
            return parseFloat(b.TotalPay) - parseFloat(a.TotalPay);
        });

        // Slice the first 10 objects for plotting
        data_men = data_men.slice(0, limit);
        data_women = data_women.slice(0, limit);

        // Reverse the array due to Plotly's defaults
        data_men = data_men.reverse();
        data_women = data_women.reverse();

        //Extract Data
        var jobTitleMen = [];
        var meanPayMen = [];
        for (var i = 0; i < data_men.length; i++) {
            jobTitleMen.push(data_men[i][1].JobTitle);
            meanPayMen.push(data_men[i][1].TotalPay);
        }

        var jobTitleWomen = [];
        var meanPayWomen = [];
        for (var i = 0; i < data_women.length; i++) {
            jobTitleWomen.push(data_women[i][1].JobTitle);
            meanPayWomen.push(data_women[i][1].TotalPay);
        }

        // Trace1 for the Data
        var trace1 = {
            x: meanPayMen,
            y: jobTitleMen,
            text: jobTitleMen,
            name: "Salary",
            type: "bar",
            orientation: "h",
            marker: {
                color: 'orange',
                line: { color: 'transparent' }
            }
        };
        var trace2 = {
            x: meanPayWomen,
            y: jobTitleWomen,
            text: jobTitleWomen,
            name: "Salary",
            type: "bar",
            orientation: "h",
            marker: {
                color: 'purple',
                line: { color: 'transparent' }
            }
        };

        // data
        var dataTraceMen = [trace1];
        var dataTraceWomen = [trace2];

        // Apply the group bar mode to the layout
        var layoutMen = {
            autosize: false,
            height: limit * height,
            width: 1000,
            title: "Mean Salaries by Job Title for Men",
            xaxis: { title: "Average Salary ($)" },
            margin: {
                l: 300,
                r: 100,
                t: 100,
                b: 100
            },
            titlefont: {
                size: 25,
                family: 'Bold',
                color: 'Black'
            },
            font: {
                family: 'Bold',
                size: 17,
                color: 'Black'
            }
        };
        var layoutWomen = {
            autosize: false,
            height: limit * height,
            width: 1000,
            title: "Mean Salaries by Job Title for Women",
            xaxis: { title: "Average Salary ($)" },
            margin: {
                l: 300,
                r: 100,
                t: 100,
                b: 100
            },
            titlefont: {
                size: 25,
                family: 'Bold',
                color: 'Black'
            },
            font: {
                family: 'Bold',
                size: 17,
                color: 'Black'
            }
        };

        // Render the plot to the div tag with id "plot"
        Plotly.newPlot("menplot", dataTraceMen, layoutMen);
        Plotly.newPlot("womenplot", dataTraceWomen, layoutWomen);

        $('#graphs').show();
        $('#gif').hide();
    });
}