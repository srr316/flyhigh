var currentPosition = {}; //holds the user's location as soon as page is loaded
var reviews = []; //holds reviews and deleted reviews in reverse chronological order
var lastUpdateTime = new Date(); //last time the reviews were refreshed
var interval = window.setInterval(checkFreshnessRequest, 10000);

var sortFunctions = {};
sortFunctions.dateAscending = function(a, b) {
	return b.date - a.date;
};
sortFunctions.dateDescending = function(a, b) {
	return a.date - b.date;
};
sortFunctions.ratingAscending = function(a, b) {
	return b.stars - a.stars;
};
sortFunctions.ratingDescending = function(a, b) {
	return a.stars - b.stars;
};

var sortFunction = sortFunctions.dateDescending;

document.addEventListener( "DOMContentLoaded", init, false )

function checkFreshnessRequest() {
	var now = new Date();
	var url = "refresh?time=" + now.getTime();
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.onreadystatechange = function() {//Call a function when the state changes.
		if(request.readyState == 4 && request.status == 200) {
			if (parseInt(request.responseText) > lastUpdateTime.getTime()) {
				downloadReviewRequest();
			}
		}
	};
	request.send(null);
}

function deleteReviewRequest(id) {
	var url = "delete";
	var request = new XMLHttpRequest();
	request.open("POST", url, true);
	request.onreadystatechange = function() {//Call a function when the state changes.
		if(request.readyState == 4 && request.status == 200) {
			downloadReviewRequest();
		}
	};
	request.send(id);
}

function uploadReviewRequest(review) {
	var url = "submit";
	var request = new XMLHttpRequest();
	request.open("POST", url, true);
	request.onreadystatechange = function() {//Call a function when the state changes.
	    if(request.readyState == 4 && request.status == 200) {
	    	downloadReviewRequest();
	    }
	};
	request.send(review);
}

function downloadReviewRequest() {
	var now = new Date();
	var url = "download?time=" + now.getTime();
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.onreadystatechange = function() {//Call a function when the state changes.
	    if(request.readyState == 4 && request.status == 200) {
	        reviews = JSON.parse(request.responseText);
	        lastUpdateTime = new Date();
	        refreshReviews();
	    }
	};
	request.send(null);
}

//Initial page setup
function init(event) {
	getMyLocation();
	downloadReviewRequest();
	var button = document.getElementById("review_submit");
	button.onclick = submitReview;
	
	var newest = document.getElementById("dateDesc");
	newest.onclick = function() {
		sortFunction = sortFunctions.dateDescending;
		refreshReviews();
	}
	
	var oldest = document.getElementById("dateAsc");
	oldest.onclick = function() {
		sortFunction = sortFunctions.dateAscending;
		refreshReviews();
	}
	
	var highest = document.getElementById("ratingDesc");
	highest.onclick = function() {
		sortFunction = sortFunctions.ratingDescending;
		refreshReviews();
	}
	
	var lowest = document.getElementById("ratingAsc");
	lowest.onclick = function() {
		sortFunction = sortFunctions.ratingAscending;
		refreshReviews();
	}
}

function refreshReviews() {
	
	//remove all reviews:
	var reviewsDiv = document.getElementById("reviews");
	while (reviewsDiv.firstChild) {
		reviewsDiv.removeChild(reviewsDiv.firstChild);
	}
	
	//remove all deleted reviews
	var deletedReviewsDiv = document.getElementById("deleted_reviews");
	while (deletedReviewsDiv.firstChild) {
		deletedReviewsDiv.removeChild(deletedReviewsDiv.firstChild);
	}
	
	//sort reviews
	reviews.sort(sortFunction);
	
	//display all reviews and deleted reviews with replies
	var country = document.getElementsByTagName("body")[0].id;
	
	for (var i = reviews.length - 1; i >= 0; i--) {
		if (reviews[i].country == country) {
			if (reviews[i].deleted) {
				displayDeletedReview(reviews[i]);
			}
			else {
				displayReview(reviews[i]);
			}
		}
	}
	
	//fill list of reviews that can be replied to:
	populateReplyList();
	
	//clear timer and reset to 10 seconds:
	window.clearInterval(interval);
	interval = window.setInterval(checkFreshnessRequest, 10000);
}

//handles clicking of delete button.
function deleteReview(elemId) {	
	var id = elemId.substring(7);
	deleteReviewRequest(id);
}

//handle when Review is submitted
function submitReview() {
	var name = document.getElementById("review_name").value;
	var subject = document.getElementById("review_subject").value;
	var reviewBody = document.getElementById("review_body").value;
	var stars = getStars();
	var now = new Date();
	var reviewIndex = getReviewIdFromList();
	
	//error checking:
	if (name == "" || subject == "" || reviewBody == "") {
		document.getElementById("error").innerHTML = "Please fill all text fields.";
		return;
	}
	else if (!document.getElementById("manager").checked && !document.getElementById("traveller").checked) {
		document.getElementById("error").innerHTML = "Please select traveller or manager.";
		return;
	}
	else if (document.getElementById("traveller").checked && stars == 0) {
		document.getElementById("error").innerHTML = "Please give a ranking.";
		return;
	}
	else if (document.getElementById("manager").checked && reviewIndex == -1) {
		document.getElementById("error").innerHTML = "There are no reviews available to reply to.";
		return;
	}
	
	var country = document.getElementsByTagName("body")[0].id;
	
	if (document.getElementById("traveller").checked) {	
		var review = new Review(name, subject, now.getTime(), reviewBody, currentPosition, stars, country);
		uploadReviewRequest(JSON.stringify(review));
	}
	else {
		var reply = new Reply(name, subject, now.getTime(), reviewBody, currentPosition, reviews[reviewIndex].date);
		uploadReviewRequest(JSON.stringify(reply));
	}
	
	document.getElementById("review_name").value = "";
	document.getElementById("review_subject").value = "";
	document.getElementById("review_body").value = "";
	document.getElementById("error").innerHTML = "";
	
}

//returns number of stars selected
function getStars() {
	if (document.getElementById("star_1").checked) {
		return 1;
	}
	else if (document.getElementById("star_2").checked) {
		return 2;
	}
	else if (document.getElementById("star_3").checked) {
		return 3;
	}
	else if (document.getElementById("star_4").checked) {
		return 4;
	}
	else if (document.getElementById("star_5").checked) {
		return 5;
	}
	else {
		return 0; //if no stars selected
	}
}

//returns index of review selected from manager reply-to list
function getReviewIdFromList() {
	//retrieve index of review selected in drop-down list for manager posts
	var selectionIndex = document.getElementById("reply_select").selectedIndex;
	
	//return -1 if there are no reviews in the list
	if (selectionIndex == -1) {
		return selectionIndex;
	}
	
	//return index of chosen review
    var id = document.getElementsByTagName("option")[selectionIndex].id;
    for (var i = 0; i < reviews.length; i++) {
    	if (reviews[i].date.toString() == id.substring(7)) {
    		return i;
    	}
    }
}

//creates list for reviews that a manager can reply to
function populateReplyList() {
	var selectList = document.getElementById("reply_select");
	
	while(selectList.firstChild) {
		selectList.removeChild(selectList.firstChild);
	}
	
	var country = document.getElementsByTagName("body")[0].id;
	for (var i = reviews.length - 1; i >= 0; i--) {
		if (reviews[i].deleted == false && reviews[i].reply == null && reviews[i].country == country) {
			var option = document.createElement("option");
			option.innerHTML = reviews[i].subject;
			option.id = "option_" + reviews[i].date.toString();
			selectList.appendChild(option);
		}
	}
}

//builds the DOM tree for a review in HTML
function buildReview(reviewDiv, review, reply) {
	
	var location = document.createElement("div");
	location.className = "location";
	
	
	
	var locationMap = document.createElement("div");
	locationMap.className = "map";
	location.appendChild(locationMap);
	
	var deleteButton = document.createElement("button");
	deleteButton.innerHTML = "Click here to delete this Review";
	var delId = "delete_" + review.date.toString();
	deleteButton.id = delId;
	deleteButton.addEventListener("click", function(){
	    deleteReview(delId);
	});
	
	location.appendChild(deleteButton);
	
	reviewDiv.appendChild(location);
	//uses deleted review code since a deleted review has a subset of a normal review's data
	buildDeletedReview(reviewDiv, review, reply);
	
	displayMap(review.location, locationMap);
}

//build DOM tree for a deleted review
function buildDeletedReview(reviewDiv, review, reply) {
	
	var subject = document.createElement("h3");
	
	var subjectHTML ="Review by : " +review.name + "<br>";
	if (!reply) {
		subjectHTML += "   Ratings: " + review.stars + "";
	}

	subject.innerHTML = subjectHTML;

	reviewDiv.appendChild(subject);
	
	var time = new Date(review.date);
	var nameAndDate = document.createElement("p");
	nameAndDate.innerHTML = "Destination: " +"<br>" + review.subject + "<br>"+  "<br>";
	var nameAndDate1= document.createElement("p1")
	nameAndDate1.innerHTML= "  And this was posted on : "+ time.toLocaleString();
	
	reviewDiv.appendChild(nameAndDate);
	reviewDiv.appendChild(nameAndDate1);
	var body = document.createElement("blockquote");
	body.innerHTML = "Review: " + review.body;
	reviewDiv.appendChild(body);
}

//determines if a review has a reply, and builds it accordingly
function displayReview(review) {
	
	var reviewDiv = document.createElement("div");
	reviewDiv.className = "review";
	reviewDiv.id = "review_" + review.date.toString();
	
	var reviewsDiv = document.getElementById("reviews");
	reviewsDiv.appendChild(reviewDiv);
	
	buildReview(reviewDiv, review, false);
	
	if (review.reply != null) {
		var replyDiv = document.createElement("div");
		replyDiv.className = "reply";
		replyDiv.id = "reply_" + review.reply.date.toString();
		reviewDiv.appendChild(replyDiv);
		buildReview(replyDiv, review.reply, true);
	}
}

//determines if a deleted review has a reply and builds it accordingly
function displayDeletedReview(review) {
	
	var deletedReviewDiv = document.createElement("div");
	deletedReviewDiv.className = "deleted_review";
	
	buildDeletedReview(deletedReviewDiv, review, false);
	
	if (review.reply != null) {
		var replyDiv = document.createElement("div");
		replyDiv.className = "deleted_reply";
		buildDeletedReview(replyDiv, review.reply, true);
		deletedReviewDiv.appendChild(replyDiv);
	}
	
	var deletedReviewsDiv = document.getElementById("deleted_reviews");
	deletedReviewsDiv.appendChild(deletedReviewDiv);	
}

//Review Constructor
function Review(name, subject, date, body, location, stars, country) {
	this.name = name;
	this.subject = subject;
	this.date = date;
	this.body = body;
	this.location = location;
	this.stars = stars;
	this.country = country;
	this.deleted = false;
	this.reply = null;
}

//Reply Constructor
function Reply(name, subject, date, body, location, reviewID) {
	this.name = name;
	this.subject = subject;
	this.date = date;
	this.body = body;
	this.location = location;
	this.reviewID = reviewID; //actually the date of the review in ms
}

/**
Location Functions:
*/

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