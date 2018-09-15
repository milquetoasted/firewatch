
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
