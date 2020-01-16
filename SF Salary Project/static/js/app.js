$(document).ready(function() {
    buildGenderCharts(2014);

    //Event listeners
    $('#years').change(function() {
        $('#graphs').hide();
        $('#gif').show();

        var year = $('#years').val();

        buildGenderCharts(year);
    });
});

function buildGenderCharts(year) {
    d3.json(`/genders/` + year).then((data) => {
        var objs = Object.values(data);
        var years = [];
        var avgPay = [];
        var medPay = [];
        var maxPay = [];
        var genders = [];
        for (var i = 0; i < objs.length; i++) {
            years.push(objs[i].Year);
            avgPay.push(objs[i].AveragePay);
            medPay.push(objs[i].MedianPay);
            maxPay.push(objs[i].MaxPay);
            genders.push(objs[i].Gender);
        }

        var barLayout = {
            width: 1200,
            height: 500,
            margin: { t: 40 },
            barmode: 'group',
            hovermode: "closest",
            xaxis: { title: "Gender" },
            yaxis: { title: "Total Pay ($)" },
            title: "Male vs Female Salary",
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
        var trace1 = {
            x: genders,
            y: avgPay,
            name: "Average",
            type: "bar",
            marker: {
                color: "purple"
            }
        };
        var trace2 = {
            x: genders,
            y: medPay,
            name: "Median",
            type: "bar",
            marker: {
                color: "orange"
            }
        };
        var trace3 = {
            x: genders,
            y: maxPay,
            name: "Maximum",
            type: "bar",
            marker: {
                color: "pink"
            }
        };
        barData = [trace1, trace2, trace3]
        Plotly.newPlot("bar", barData, barLayout);

        $('#graphs').show();
        $('#gif').hide();
    });
};