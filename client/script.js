
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

map.addEventListener('tap', function(evt) {
  console.log(evt.type, evt.currentPointer.type);
});

var behavior = new H.mapevents.Behavior(mapEvents);

var ui = H.ui.UI.createDefault(map, layers);

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

function loadKMLFile() {
  var kml = new nokia.maps.kml.Manager();
  // We define a callback function for parsing kml file,
  // and then push the parsing result to map display
  // Add an observer to kml manager
  kml.addObserver("state", onKMLParsed);
  kml.parseKML("data/local.kml");
}
function onKMLParsed(kmlManager) {
  var resultSet;
  // KML file was successfully loaded
  if (kmlManager.state === "finished") {
    // KML file was successfully parsed
    resultSet = new nokia.maps.kml.component.KMLResultSet(kmlManager.kmlDocument, map);
    resultSet.addObserver("state", function (resultSet) {
      if (resultSet.state === "finished") {
        // Retrieve map objects container from KML resultSet
        container = resultSet.container;

        // Add the container to the map's object collection so they will be rendered onto the map.
        map.objects.add(container);

        // Switch the viewport of the map do show all KML map objects within the container
        map.zoomTo(container.getBoundingBox());
      }
    });
    resultSet.create();
  }
}
// initialize vue

var app = new Vue({
  el: '#app',
  data: {
    news: []
  }
});
