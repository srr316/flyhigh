function getMyLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(storeLocation);
	}
	else {
		alert("Oops, no geolocation support.");
	}
}

//puts user's location in global variable
function storeLocation(position) {
	if (!position) {
		//set default position if no geolocation support.
		currentPosition.latitude = 0;
		currentPosition.longitude = 0;
		return;
	}
	currentPosition.latitude = position.coords.latitude;
	currentPosition.longitude = position.coords.longitude;
}


//displays coordinates, given coordinates
function displayLocation(coords) {
	return "Lat: " + coords.latitude.toFixed(2) + ", Long: " + coords.longitude.toFixed(2);
}

//displays map, given coordinates and div id.
function displayMap(coords, elem) {
	var googleLatAndLong = new google.maps.LatLng(coords.latitude, coords.longitude);
	
	var mapOptions = {
		zoom: 10,
		center: googleLatAndLong,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	var map = new google.maps.Map(elem, mapOptions);
	var title = "Reviewer's Location";
	var content = "Reviewer was here: " + coords.latitude + ", " + coords.longitude;
	addMarker(map, googleLatAndLong, title, content);
	
}	

//puts marker on map (off-centered currently?) 
function addMarker(map, latlong, title, content) {
	var markerOptions = {
		position: latlong,
		map: map,
		title: title,
		clickable: true
	};
	
	var marker = new google.maps.Marker(markerOptions);
	
	var infoWindowOptions = {
		content: content,
		position: latlong
	};
	
	var infoWindow = new google.maps.InfoWindow(infoWindowOptions);
	
	google.maps.event.addListener(marker, "click", function() {
		infoWindow.open(map);
	});
}