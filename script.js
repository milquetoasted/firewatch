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

const LEFT_PADDING = 5;

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

var routeLine;

// Define a callback function to process the routing response:
var onResult = function(result) {
  var route,
    routeShape,
    startPoint,
    endPoint,
    linestring;
  if(result.response.route) {
  // Pick the first route from the response:
  route = result.response.route[0];
  // Pick the route's shape:
  routeShape = route.shape;

  // Create a linestring to use as a point source for the route line
  linestring = new H.geo.LineString();

  // Push all the points in the shape into the linestring:
  routeShape.forEach(function(point) {
    var parts = point.split(',');
    linestring.pushLatLngAlt(parts[0], parts[1]);
  });

  // Retrieve the mapped positions of the requested waypoints:
  startPoint = route.waypoint[0].mappedPosition;
  endPoint = route.waypoint[1].mappedPosition;

  // Create a polyline to display the route
  routeLine = new H.map.Polyline(linestring, {
    style: { lineWidth: 10 },
    arrows: { fillColor: 'white', frequency: 2, width: 0.8, length: 0.7 }
  });

  // Create a marker for the start point:
  // var startMarker = new H.map.Marker({
  //   lat: startPoint.latitude,
  //   lng: startPoint.longitude
  // });

  // Create a marker for the end point:
  // var endMarker = new H.map.Marker({
  //   lat: endPoint.latitude,
  //   lng: endPoint.longitude
  // });

  // Add the route polyline and the two markers to the map:
  map.addObjects([routeLine]);

  // Set the map's viewport to make the whole route visible:
  // map.setViewBounds(routeLine.getBounds());
  }
};

// Get an instance of the routing service:
var router = platform.getRoutingService();

var destination;

/**
 * Create a marker that is capable of receiving DOM events and add it
 * to the map.
 *
 * @param  {H.Map} map      A HERE Map instance within the application
 */
function addDomMarker(map) {
  var outerElement = document.createElement('div'),
      innerElement = document.createElement('div');

  outerElement.style.userSelect = 'none';
  outerElement.style.webkitUserSelect = 'none';
  outerElement.style.msUserSelect = 'none';
  outerElement.style.mozUserSelect = 'none';
  outerElement.style.cursor = 'pointer';

  // innerElement.style.color = 'red';
  innerElement.style.backgroundColor = '#FF9800';
  innerElement.style.border = '1px solid #FAFAFA';
  // innerElement.style.font = 'normal 12px Karla';
  // innerElement.style.lineHeight = '12px';

  innerElement.style.borderRadius = '50%';
  innerElement.style.paddingTop = '2px';
  innerElement.style.paddingLeft = '4px';
  innerElement.style.width = '15px';
  innerElement.style.height = '15px';

  // add negative margin to inner element
  // to move the anchor to center of the div
  innerElement.style.marginTop = '-10px';
  innerElement.style.marginLeft = '-10px';

  outerElement.appendChild(innerElement);

  // Add text to the DOM element
  // innerElement.innerHTML = 'EC';

  function changeOpacity(evt) {
    evt.target.style.transform = 'scale(1.1)';
  }

  function changeOpacityToOne(evt) {
    evt.target.style.transform = 'scale(1)';
  }

  //create dom icon and add/remove opacity listeners
  var domIcon = new H.map.DomIcon(outerElement, {
    // the function is called every time marker enters the viewport
    onAttach: function(clonedElement, domIcon, domMarker) {
      clonedElement.addEventListener('mouseover', changeOpacity);
      clonedElement.addEventListener('mouseout', changeOpacityToOne);
    },
    // the function is called every time marker leaves the viewport
    onDetach: function(clonedElement, domIcon, domMarker) {
      clonedElement.removeEventListener('mouseover', changeOpacity);
      clonedElement.removeEventListener('mouseout', changeOpacityToOne);
    }
  });

  for (i=0; i<evacuationCenters.length; i++) {
    // Marker for evacuation center
    var evacuationCenterMarker = new H.map.DomMarker(
      {
        lat: evacuationCenters[i].LATITUDE,
        lng: evacuationCenters[i].LONGITUDE
      },
      {
        icon: domIcon
      });
    evacuationCenterMarker.setData(i);
    evacuationCenterMarker.addEventListener('tap', function(evt) {
      // event target is the marker itself, group is a parent event target
      // for all objects that it contains
      for (i=0; i<evacuationCenters.length; i++) {
        evacuationMarkers[i].setVisibility(true);
      }
      var index = this.getData();

      var coords = { lat: evacuationCenters[index].LATITUDE, lng: evacuationCenters[index].LONGITUDE };

      if (destination) {
        destination.setVisibility(false);
      }
      if (routeLine) {
        routeLine.setVisibility(false);
      }
      destination = new H.map.DomMarker(coords, {zIndex: 99999});

      var selectedIndex = 0;

      for (i=0; i<evacuationCenters.length; i++) {
        if (evacuationCenters[index].SHELTER_NAME === sortedCenters[i].SHELTER_NAME) {
          selectedIndex = i;
        }
      }

      app.selectedCenter = selectedIndex;

      map.addObject(destination);

      this.setVisibility(false);

      var group = new H.map.Group();

      var leftCoordsDest = { lat: evacuationCenters[index].LATITUDE, lng: evacuationCenters[index].LONGITUDE - LEFT_PADDING };
      var leftCoordsInit = { lat: here.getPosition().lat, lng: here.getPosition().lng - LEFT_PADDING };
      ghostDestLeft = new H.map.DomMarker(leftCoordsDest);
      ghostInitLeft = new H.map.DomMarker(leftCoordsInit);

      // add markers to the group
      group.addObjects([here, destination, ghostDestLeft, ghostInitLeft]);
      map.addObject(group);

      ghostDestLeft.setVisibility(false);
      ghostInitLeft.setVisibility(false);

      // get geo bounding box for the group and set it to the map
      map.setViewBounds(group.getBounds(), true);

      // Create the parameters for the routing request:
      var routingParameters = {
        // The routing mode:
        'mode': 'fastest;car',
        // The start point of the route:
        'waypoint0': 'geo!' + here.getPosition().lat + ',' + here.getPosition().lng,
        // The end point of the route:
        'waypoint1': 'geo!' + destination.getPosition().lat + ',' + destination.getPosition().lng,
        // To retrieve the shape of the route we choose the route
        // representation mode 'display'
        'representation': 'display'
      };

      // Call calculateRoute() with the routing parameters,
      // the callback and an error callback function (called if a
      // communication error occurs):
      router.calculateRoute(routingParameters, onResult,
        function(error) {
          alert(error.message);
        });

      var container = document.getElementById('evacuationCentersID');
      container.scrollTop = 0;
    });
    evacuationMarkers.push(evacuationCenterMarker);
    map.addObject(evacuationCenterMarker);
  } 
}

evacuationMarkers = [];
addDomMarker(map);

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
    calculateDistance(here, 'K');
    map.addObject(here);
    reverseGeocode(platform, crd.latitude + ',' + crd.longitude);
  }, 1000);
}

function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	if (dist > 1) {
		dist = 1;
	}
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;
	if (unit=="K") {
    dist = dist * 1.609344;
  }
	if (unit=="N") {
    dist = dist * 0.8684;
  }
	return dist;
}

function calculateDistance(fromHere) {
  for (i=0; i<evacuationCenters.length; i++) {
    evacuationCenters[i].DISTANCE = Math.round(distance(
      fromHere.getPosition().lat,
      fromHere.getPosition().lng,
      evacuationCenters[i].LATITUDE,
      evacuationCenters[i].LONGITUDE
    ));
  }
  app.doneLoading = true;
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
  calculateDistance(here, 'K');
  map.addObject(here);
  reverseGeocode(platform, crd.lat() + ',' + crd.lng());
});

var notifLocation;

var input2 = document.getElementById('psw');
var autocomplete2 = new google.maps.places.Autocomplete(input2);
autocomplete2.setFields(['address_components', 'geometry', 'name']);

autocomplete2.addListener('place_changed', function () {
  var crd = autocomplete2.getPlace().geometry.location;
  notifLocation = { lat: crd.lat(), lng: crd.lng() };
  console.log(notifLocation);
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

function compareDistances(a, b) {
  return a.DISTANCE - b.DISTANCE;
}

var sortedCenters = evacuationCenters.slice();

// initialize vue

var app = new Vue({
  el: '#app',
  data: {
    city: '',
    routing: false,
    doneLoading: false,
    selectedCenter: -1,
    location: '',
    news: []
  },
  methods: {
    getNearbyCenters: function() {
      if (this.selectedCenter > -1) {
        sortedCenters = sortedCenters.splice(this.selectedCenter, 1)
          .concat(sortedCenters.sort(compareDistances));
        this.selectedCenter = 0;
      } else {
        sortedCenters.sort(compareDistances);
      }
      return sortedCenters;
    },
    setDestination: function(newIndex) {
      var index = 0;

      for (i=0; i<evacuationCenters.length; i++) {
        if (evacuationCenters[i].SHELTER_NAME === sortedCenters[newIndex].SHELTER_NAME) {
          index = i;
        }
        evacuationMarkers[i].setVisibility(true);
      }

      var coords = { lat: evacuationCenters[index].LATITUDE, lng: evacuationCenters[index].LONGITUDE };
      if (destination) {
        destination.setVisibility(false);
      }
      if (routeLine) {
        routeLine.setVisibility(false);
      }
      destination = new H.map.DomMarker(coords, {zIndex: 99999});

      this.selectedCenter = newIndex;

      map.addObject(destination);

      evacuationMarkers[index].setVisibility(false);

      var group = new H.map.Group();

      var leftCoordsDest = { lat: evacuationCenters[index].LATITUDE, lng: evacuationCenters[index].LONGITUDE - LEFT_PADDING };
      var leftCoordsInit = { lat: here.getPosition().lat, lng: here.getPosition().lng - LEFT_PADDING };
      ghostDestLeft = new H.map.DomMarker(leftCoordsDest);
      ghostInitLeft = new H.map.DomMarker(leftCoordsInit);

      // add markers to the group
      group.addObjects([here, destination, ghostDestLeft, ghostInitLeft]);

      map.addObject(group);

      ghostDestLeft.setVisibility(false);
      ghostInitLeft.setVisibility(false);

      // get geo bounding box for the group and set it to the map
      map.setViewBounds(group.getBounds(), true);

      // Create the parameters for the routing request:
      var routingParameters = {
        // The routing mode:
        'mode': 'fastest;car',
        // The start point of the route:
        'waypoint0': 'geo!' + here.getPosition().lat + ',' + here.getPosition().lng,
        // The end point of the route:
        'waypoint1': 'geo!' + destination.getPosition().lat + ',' + destination.getPosition().lng,
        // To retrieve the shape of the route we choose the route
        // representation mode 'display'
        'representation': 'display'
      };

      // Call calculateRoute() with the routing parameters,
      // the callback and an error callback function (called if a
      // communication error occurs):
      router.calculateRoute(routingParameters, onResult,
        function(error) {
          alert(error.message);
        });
      
      var container = this.$el.querySelector('#evacuationCentersID');
      container.scrollTop = 0;
    }
  }
});

var headerApp = new Vue({
  el: '#headerApp',
  data: {
    routing: false
  },
  methods: {
    toggleFunction: function() {
      this.routing = !this.routing;
      app.routing = this.routing;
    }
  }
});

$(".open").on("click", function(){
  $(".popup-overlay, .popup-content").addClass("active");
  $(".pac-container:eq(1)").css("z-index","1203981092383");
});

$(".modal-header .close").on("click", function(){
  $("#error").hide();
});

// ---- Sending Emails ----
emailjs.init("user_Dsmojbc6gL2DzkZs4Bck7");

var address = "";

// Sends email to address
function sendEmail (address) {
   var template_params = {
       "to_email": address
    }

    var service_id = "default_service";
    var template_id = "template_VvOf8Tmd";
    emailjs.send(service_id, template_id, template_params);
}

socket.on("mans not hot", function(data){
  if(!data) {
    alert("Check for nearby fires on the map");
    sendEmail(address);
  } else {
    alert("You are not currently near any fires");
  }
  reverseGeocode(platform, notifLocation.lat + ',' + notifLocation.lng);
})

function submitForm(e){
  address = $("#usrname")[0].value;
  if(notifLocation && address) {
    $("#error").hide();
    $('#myModal').modal('hide');
    console.log(notifLocation);
    map.removeObject(here);
    map.setCenter(notifLocation, true);
    map.setZoom(8, true);
    here = new H.map.Marker(notifLocation);
    map.addObject(here);
    socket.emit('am i dead', notifLocation);
  }
  else {
    $("#error").show();
  }
  return false;
}
