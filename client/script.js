
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
layers.normal.xbase,
{
  zoom: 3,
  center: { lng: -100, lat: 40 }
});

var mapEvents = new H.mapevents.MapEvents(map);

map.addEventListener('tap', function(evt) {
  console.log(evt.type, evt.currentPointer.type);
});

var behavior = new H.mapevents.Behavior(mapEvents);

var ui = H.ui.UI.createDefault(map, layers);

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
      //eps: 32,
      // minimum weight of points required to form a cluster
      //minWeight: 2
    }
  });

  // Create a layer tha will consume objects from our clustering provider
  var clusteringLayer = new H.map.layer.ObjectLayer(clusteredDataProvider);

  // To make objects from clustering provder visible,
  // we need to add our layer to the map
  map.addLayer(clusteringLayer);
}

var socket = io();
socket.emit('lit fam');
socket.on('oh no', function(data) {
  startClustering(map, data);
});

var options = {
  enableHighAccuracy: true,
  maximumAge: 0
};

var here;

function positionSuccess(pos) {
  var crd = pos.coords;
  var ll = {lat:crd.latitude, lng:crd.longitude};

  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);

  setTimeout(() => {
    map.setCenter(ll, true);
    map.setZoom(4, true);
    here = new H.map.Marker(ll);
    map.addObject(here);
  },1000);
}

function positionError(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(positionSuccess, positionError, options);

var input = document.getElementById('search');
var autocomplete = new google.maps.places.Autocomplete(input);
autocomplete.setFields(['address_components', 'geometry', 'name']);

autocomplete.addListener('place_changed', function() {
  var crd = autocomplete.getPlace().geometry.location;
  map.removeObject(here);
  var ll = {lat:crd.lat(), lng:crd.lng()};
  console.log(ll);
  map.setCenter(ll, true);
  map.setZoom(4, true);
  here = new H.map.Marker(ll);
  map.addObject(here);
});

// set up news search api

function searchNews(location) {
  var url = 'https://newsapi.org/v2/everything?' +
  'q=+' + location + ',+forest,+fire&' +
  'sortBy=popularity&' +
  'apiKey=83fa8de5555f42179dca7d75e4184d41';

  var req = new Request(url);

  fetch(req)
    .then(function(response) {
      console.log(response.json());
    });
}

// initialize vue

var app = new Vue({
  el: '#app',
  data: {
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