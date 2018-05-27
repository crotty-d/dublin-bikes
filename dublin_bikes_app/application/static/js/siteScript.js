'use strict';
//--------------------------------------------------------------
// Global variables
//--------------------------------------------------------------
const jcdUrl = "https://api.jcdecaux.com/vls/v1/stations";
const jcdParams = "?contract=Dublin&apiKey=8b0bfe2e205616b7ebec9f675e2168f7b9726683";
const weatherUrl = "http://api.openweathermap.org/data/2.5/forecast?id=7778677&APPID=2a4ae98d608786fcf5b6bbcf5a9467d6"

//--------------------------------------------------------------
// Functions
//--------------------------------------------------------------

// Gets current weather from opeweathermaps API and displays in wether panel (div)
function currentWeather(weatherUrl) {
    $.getJSON(weatherUrl, function(w_result) {
        var weather = w_result.list[0].weather[0]
        $("#weather-descript").html(weather.description + "&nbsp" + "<img src='http://openweathermap.org/img/w/"
        + weather.icon
        + ".png' alt='weather icon'>");
    })
    .fail(function() {
        console.log("Error: Failed to get JSON data from "+ weatherUrl);
    });
}

// Generates list of stations for dropdown menu
function dropDownStations(url) {
    $.getJSON(url, function(result){
        var stationData = result;
        var html = "";
        for (var i = 0; i < stationData.length; i++) {
            var name = stationData[i].address;
            var number = stationData[i].number;
            html += ('<li><a onclick="updateData(\''+ number + '\')">' + name + '</a></li>');
        }
        $("#station-dropdown").html(html);
    })
    .fail(function() {
        console.log("Error: Failed to get JSON data from "+ url);
    });
}

// Generates Chart.js bar chart
function createBarChart(elemId, chartData, labels, title) {
    // DOM element to hold chart
    var chart = document.getElementById(elemId).getContext('2d');

    // Create chart
    var barChart = new Chart(chart,{
        type: 'bar',
        data: {
            labels: labels,

            datasets: [
                {
                    label: "Average",
                    backgroundColor: "#1996ff",
                    data: chartData
                }
            ]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    ticks: { beginAtZero: true }
                }]
            }
        }
    });

    return barChart;
}

// Generates Chart.js line chart
function createLineChart(elemId, dataSeries, labels, title) {
    // DOM element to hold chart
    var CHART = document.getElementById(elemId).getContext('2d');

    // Create chart
    var lineChart = new Chart(CHART, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataSeries[0],
                label: "Monday",
                borderColor: "#244dff",
                fill: false
              }, {
                data: dataSeries[1],
                label: "Tuesday",
                borderColor: "#8e5ea2",
                fill: false
              }, {
                data: dataSeries[2],
                label: "Wednesday",
                borderColor: "#17ffab",
                fill: false
              }, {
                data: dataSeries[3],
                label: "Thursday",
                borderColor: "#64fc7c",
                fill: false
              }, {
                data: dataSeries[4],
                label: "Friday",
                borderColor: "#ff3d4f",
                fill: false
              }, {
                data: dataSeries[5],
                label: "Saturday",
                borderColor: "#ff38a4",
                fill: false
              }, {
                data: dataSeries[6],
                label: "Sunday",
                borderColor: "#3e95cd",
                fill: false
              }
            ]
          },
        options:{
            title: {
                display: true,
                text: title
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                boxWidth: 10,
                fontColor: 'black'
                }
            }
        }

    });

    return lineChart;
}

// Update station availability panel and charts
function updateData(stationNumber) {

    // Update station info panel
    var jcdecUrl = jcdUrl+"/"+stationNumber+jcdParams;
    //var html = ""
    $.getJSON(jcdecUrl, function(jcd_result) {
        // Station info
        var html = "<h2>" + jcd_result.address + "</h2><div class='descript top-pad-20 center-align'>";
        html += "<p>Available bikes: " + jcd_result.available_bikes + "</p>";
        html += "<p>Free bike stands: " + jcd_result.available_bike_stands + "</p>";
        html += "<p>Station status: " + jcd_result.status + "</p></div>";
        // Insert all the new html into station info panel
        document.getElementById('station-info').innerHTML = html;
    })
    .fail(function() {
        console.log("Error: Failed to get JSON data from "+ jcdecUrl);
    });

    // Update charts
    updateCharts(stationNumber)
}

// Update charts only
function updateCharts(stationNumber) {
    var flaskUrl = $SCRIPT_ROOT + "/station_stats/" + stationNumber;
    $.getJSON(flaskUrl, function(result) {
        //console.log("Returned historical data: ", result);

        // Daily chart
        //- Store and prepare the new data from the JSON file
        var dailyData = result.station_stats.daily_avg;
        var dailyChartData = [dailyData.Monday, dailyData.Tuesday, dailyData.Wednesday, dailyData.Thursday, dailyData.Friday, dailyData.Saturday, dailyData.Sunday];
        //- Modify the chart data
        dailyChart.data.datasets[0].data = dailyChartData;
        //- Update the chart display
        dailyChart.update();

        // Hourly chart
        //- Store and prepare the new data from the JSON file
        var hourlyData = result.station_stats.hourly_avg;
        var hourlyChartData = [hourlyData.Monday, hourlyData.Tuesday, hourlyData.Wednesday, hourlyData.Thursday, hourlyData.Friday, hourlyData.Saturday, hourlyData.Sunday];
        //- Modify the chart data
        for (var i = 0; i < hourlyChartData.length; i++) {
            hourlyChart.data.datasets[i].data = hourlyChartData[i];
        }
        //- Update the chart display
        hourlyChart.update();
    })
    .fail(function() {
        console.log("Error: Failed to get JSON data from "+ flaskUrl);
    });
}


//--------------------------------------------------------------
// Main
//--------------------------------------------------------------

/***** Display current weather *****/
currentWeather(weatherUrl)

/***** Dropdown list to select station *****/
dropDownStations($SCRIPT_ROOT + "/static/data/Dublin.json");


/***** Charts ******/
// Initialize daily average chart
var url = $SCRIPT_ROOT + "/station_stats/" + "37";
var chartDataDaily = [4,4,4,4,4,4,4]; // initial dummy data; makes initial animation smoother
var labelsDaily = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// Create daily chart in canvas on html page
var dailyChart = createBarChart("daily-chart", chartDataDaily, labelsDaily, "Average bike availability per day");
// Add inital real data from database via API call to flask app
updateCharts("37");

// Initialize hourly average chart
var chartDataHourly = new Array(7); // initial dummy data; makes initial animation smoother
for (var i = 0; i < 7; i++) {
    chartDataHourly[i] = Array(20).fill(0);
}
var labelsHourly = ["05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00", "00:00"];
// Create daily chart in canvas on html page
var hourlyChart = createLineChart("hourly-chart", chartDataHourly, labelsHourly, "Average bike availability per hour per day");
// Add inital real data from database via API call to flask app
updateCharts("37");


/***** Google Map *****/
// Adds Google map to display panel using Google Maps
function initMap() {
    //Create map object and specify the element in which to display it
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 53.345, lng: -6.27},
        zoom: 13
    });

    // Add markers to map
    addMarkers(map, jcdUrl + jcdParams);
}

// Add marker for each station to Google map
function addMarkers(map, url) {
    $.getJSON(url, function(result) {
        var stationData = result;
        for (var i = 0; i < stationData.length; i++) {
            var station = stationData[i];
            //console.log(station.available_bikes);

            // Color marker (pin) according to availability
            var markColor = '#919191';
            if (station.available_bikes === 0) {
                markColor = '#919191';
            } else if (station.available_bikes < 5) {
                markColor = '#F74565';
            } else if (station.available_bikes < 10) {
                markColor =  '#fc6ae8';
            } else {
                markColor = '#6A6AFC';
            }

            // Create custom pin icon
            var pinIcon = new google.maps.MarkerImage(
                'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + markColor,
                null, /* size is determined at runtime */
                null, /* origin is 0,0 */
                null, /* anchor is bottom center of the scaled image */
                new google.maps.Size(21, 34)
            );

            // Create marker at station location
            var marker = new google.maps.Marker({
                position: station.position,
                size: 0,
                map: map,
                icon: {
                   path: google.maps.SymbolPath.CIRCLE,
                   fillColor: markColor,
                   strokeColor: '#FFF',
                   strokeWeight: 1,
                   fillOpacity: 0.7,
                   scale: Math.max(Math.min(station.available_bike_stands, 14), 8) // size according to free stands, but compress range as otherwise size differences too extreme
                },
                animation: google.maps.Animation.DROP,
                title: station.address,
                number: station.number
            });
            // Add listener to update current station data and charts on click
            marker.addListener("click", updateData.bind(null, marker.number));

        }
    });
}

// Smooth scrolling back to top of page
$(".footer a[href='#top']").on('click', function(event) {

  // Make sure this.hash has a value before overriding default behavior
  if (this.hash !== "") {

    // Prevent default anchor click behavior
    event.preventDefault();

    // Store hash
    var hash = this.hash;

    // jQuery's animate() method to smoothly scroll to top
    $('html, body').animate({
      scrollTop: $(hash).offset().top - 100
  }, 700, function(){

    // Add hash (#) to URL when done scrolling (default click behavior)
      window.location.hash = hash;
    });

  }

});
