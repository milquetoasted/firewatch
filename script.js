
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
