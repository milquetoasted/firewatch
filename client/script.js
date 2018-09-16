
// Initialize the platform object:
var platform = new H.service.Platform({
  'app_id': 'fF1mVXDKnAlRMVVwdHuO',
  'app_code': 'KyO0DGou-M7uza7g6WGlpQ'
});

// Obtain the default map types from the platform object
var layers = platform.createDefaultLayers();

// Instantiate (and display) a map object:
var map = new H.Map(
document.getElementById('mapContainer'),
layers.normal.map,
{
  zoom: 3,
  center: { lng: -100, lat: 40 }
});

var mapEvents = new H.mapevents.MapEvents(map);

map.addEventListener('tap', function(evt) {});

var behavior = new H.mapevents.Behavior(mapEvents);

var ui = H.ui.UI.createDefault(map, layers);
ui.getControl('mapsettings').setVisibility(false);

function startClustering(map, data) {
  // First we need to create an array of DataPoint objects,
  // for the ClusterProvider
  var dataPoints = data.map(function (item) {
    return new H.clustering.DataPoint(item[0], item[1]);
  });

  console.log(dataPoints);

  // Create a clustering provider with custom options for clusterizing the input
  var clusteredDataProvider = new H.clustering.Provider(dataPoints, {
    clusteringOptions: {
      // Maximum radius of the neighbourhood
      eps: 32,
      // minimum weight of points required to form a cluster
      minWeight: 2
    }
  });

  // Create a layer tha will consume objects from our clustering provider
  var clusteringLayer = new H.map.layer.ObjectLayer(clusteredDataProvider);

  // To make objects from clustering provder visible,
  // we need to add our layer to the map
  map.addLayer(clusteringLayer);

  // Add an event listener to the Provider
  clusteredDataProvider.addEventListener('pointerenter', function(e) {
    document.body.style.cursor = "pointer";
  });
  clusteredDataProvider.addEventListener('tap', function(e) {
    // Log data bound to the marker that has been tapped:
    crd = e.target.b;
    console.log(crd);
    map.removeObject(here);
    here = new H.map.Marker({lat:crd.lat, lng:crd.lng});
    map.addObject(here);
    reverseGeocode(platform, crd.lat + ',' + crd.lng);
  });
}

var socket = io();
socket.emit('lit fam');
socket.on('oh no', function(data) {
  startClustering(map, data);
});

var options = {
  enableHighAccuracy: true,
  zoom: 5,
  maximumAge: 0
};

// Show traffic tiles
map.setBaseLayer(layers.normal.traffic);

// Enable traffic incidents layer
map.addLayer(layers.incidents);

var here;

function positionSuccess(pos) {
  var crd = pos.coords;
  var ll = { lat: crd.latitude, lng: crd.longitude };

  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);

  setTimeout(() => {
    map.setCenter(ll, true);
    map.setZoom(8, true);
    here = new H.map.Marker(ll);
    map.addObject(here);
    reverseGeocode(platform, crd.latitude + ',' + crd.longitude);
  }, 1000);
}

function positionError(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

console.log('GETTING POSITION');
navigator.geolocation.getCurrentPosition(positionSuccess, positionError, options);

var input = document.getElementById('search');
var autocomplete = new google.maps.places.Autocomplete(input);
autocomplete.setFields(['address_components', 'geometry', 'name']);

autocomplete.addListener('place_changed', function getll () {
  var crd = autocomplete.getPlace().geometry.location;
  map.removeObject(here);
  var ll = { lat: crd.lat(), lng: crd.lng() };
  
  console.log(ll);
  map.setCenter(ll, true);
  map.setZoom(8, true);
  here = new H.map.Marker(ll);
  map.addObject(here);
  reverseGeocode(platform, crd.lat() + ',' + crd.lng());
});


// Sends email to address
function sendEmail (address) {
    emailjs.init("user_Dsmojbc6gL2DzkZs4Bck7");
   var template_params = {
       "to_email": "david.scowluga@gmail.com"
    }
   
    var service_id = "default_service";
    var template_id = "template_VvOf8Tmd";
    emailjs.send(service_id, template_id, template_params);
    alert("email sent"); 
} 

var data = ""; 

function checkDanger(ll) {
    var myLatitude = ll.lat; 
    var myLongitude = ll.lng; 

    var minDistance = 100; 
    var dCalculation = Math.pow(minDistance, 2);

    var rows = data.split("\n"); 
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i]; 

        var commaIndex1 = row.indexOf(","); 
        var commaIndex2 = row.indexOf(",", commaIndex1 + 1); 

        var lat = parseInt(row.slice(0, commaIndex1)); 
        var long = parseInt(row.slice(commaIndex1 + 1, commaIndex2)); 

        if (Math.pow(lat - myLatitude, 2) + Math.pow(long - myLongitude, 2) < dCalculation) {
            alert("rip"); 
            sendEmail("david.scowluga@gmail.com"); 
            return; 
        } 
    }
}


var input2 = document.getElementById('search2');
var autocomplete2 = new google.maps.places.Autocomplete(input2);
autocomplete2.setFields(['address_components', 'geometry', 'name']);

autocomplete2.addListener('place_changed', function () {
  var crd = autocomplete2.getPlace().geometry.location;
    console.log("REEEEE:" + crd); 
  var ll = { lat: crd.lat(), lng: crd.lng() };  
    console.log("RE: " + ll); 
  checkDanger(ll); 
});

// search for the address of a known location

/**
 * Calculates and displays the address details of the location found at
 * a specified location in Berlin (52.5309°N 13.3847°E) using a 150 meter
 * radius to retrieve the address of Nokia House. The expected address is:
 * Invalidenstraße 116, 10115 Berlin.
 *
 *
 * A full list of available request parameters can be found in the Geocoder API documentation.
 * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-reverse-geocode.html
 *
 * @param   {H.service.Platform} platform    A stub class to access HERE services
 */
function reverseGeocode(platform, prox) {
  var geocoder = platform.getGeocodingService(),
    reverseGeocodingParameters = {
      prox: prox,
      mode: 'retrieveAddresses',
      maxresults: '1',
      jsonattributes : 1
    };

  geocoder.reverseGeocode(
    reverseGeocodingParameters,
    onSuccess,
    onError
  );
}

/**
 * This function will be called once the Geocoder REST API provides a response
 * @param  {Object} result          A JSONP object representing the  location(s) found.
 *
 * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-type-response-geocode.html
 */
function onSuccess(result) {
  var locations = result.response.view[0].result;
  app.city = locations[0].location.address.city;
  app.location = locations[0].location.address.city + ', ' + locations[0].location.address.state;
  searchNews(app.city);
}

/**
 * This function will be called if a communication error occurs during the JSON-P request
 * @param  {Object} error  The error message received.
 */
function onError(error) {
  alert('Ooops!');
}

// set up news search api

function searchNews(location) {
  var url = 'https://newsapi.org/v2/everything?' +
    'q=+' + location + ' AND +forest AND +fire AND +wildfire&' +
    'excludeDomains=smartbitchestrashybooks.com,stltoday.com,gamasutra.com,newyorker.com,hakaimagazine.com,seekingalpha.com,thepointsguy.com&' +
    // 'from=2018-09-1&' +
    'sortBy=relevancy&' +
    'apiKey=83fa8de5555f42179dca7d75e4184d41';

  var req = new Request(url);

  fetch(req)
    .then(function (response) {
      return response.json();
    }).then(function(data) {
      app.news = data.articles;
      console.log(app.news);
    });
}

// initialize vue

var app = new Vue({
  el: '#app',
  data: {
    city: '',
    location: '',
    news: []
  }
});

$(".open").on("click", function(){
  $(".popup-overlay, .popup-content").addClass("active");
});

//removes the "active" class to .popup and .popup-content when the "Close" button is clicked
$(".close, .popup-overlay").on("click", function(){
  $(".popup-overlay, .popup-content").removeClass("active");
});

// ---- Sending Emails ---- 



var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function(){
  if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
    data = xmlhttp.responseText; 
    
  }
};
xmlhttp.open("GET","http://localhost:3000/data.csv", true);
xmlhttp.send();

$('#not').on("click", function(){
    var geocoder = platform.getGeocodingService(); 
    var parameters = {
      searchtext: search2.value,
      gen: '9'};
  geocoder.geocode(parameters,
    function (result) {
      console.log("REE: " + result); 
    }, function (error) {
      alert(error);
    }); 
});
