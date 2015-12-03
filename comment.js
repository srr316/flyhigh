var currentPosition = {};
var reviews = [];
var lastUpdateTime = new Date(); 
var interval = window.setInterval(checkFreshnessRequest, 5000);

var sortFunctions = {};


var sortFunction = function(a, b) {
	return a.date - b.date;
};

document.addEventListener( "DOMContentLoaded", init, false )


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


function Reply(name, subject, date, body, location, reviewID) {
	this.name = name;
	this.subject = subject;
	this.date = date;
	this.body = body;
	this.location = location;
	this.reviewID = reviewID;
}






function checkFreshnessRequest() {
	var now = new Date();
	var url = "refresh?time=" + now.getTime();
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.onreadystatechange = function() {
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
	request.onreadystatechange = function() {
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
	request.onreadystatechange = function() {
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
	request.onreadystatechange = function() {
	    if(request.readyState == 4 && request.status == 200) {
	        reviews = JSON.parse(request.responseText);
	        lastUpdateTime = new Date();
	        refreshReviews();
	    }
	};
	request.send(null);
}

function init(event) {
	getMyLocation();
	downloadReviewRequest();
	var button = document.getElementById("review_submit");
	button.onclick = submitReview;
	

}

function refreshReviews() {

	var reviewsDiv = document.getElementById("reviews");
	while (reviewsDiv.firstChild) {
		reviewsDiv.removeChild(reviewsDiv.firstChild);
	}
	

	var deletedReviewsDiv = document.getElementById("deleted_reviews");
	while (deletedReviewsDiv.firstChild) {
		deletedReviewsDiv.removeChild(deletedReviewsDiv.firstChild);
	}
	

	reviews.sort(sortFunction);
	
	
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
	populateReplyList();
	window.clearInterval(interval);
	interval = window.setInterval(checkFreshnessRequest, 10000);
}

function deleteReview(elemId) {	
	var id = elemId.substring(7);
	deleteReviewRequest(id);
}

function submitReview() {
	var name = document.getElementById("review_name").value;
	var subject = document.getElementById("review_subject").value;
	var reviewBody = document.getElementById("review_body").value;
	var stars = getStars();
	var now = new Date();
	var reviewIndex = getReviewIdFromList();

	if (name == "" || subject == "" || reviewBody == "") {
		alert("Please fill the text fields for name, destination and review");
		return;
	}
	else if (!document.getElementById("manager").checked && !document.getElementById("traveller").checked) {
		alert("Please choose the check box for traveller/manager");
		return;
	}
	else if (document.getElementById("traveller").checked && stars == 0) {
		alert("Give some rating, BUD!!");
		return;
	}
	else if (document.getElementById("manager").checked && reviewIndex == -1) {
		alert("Who are you replying to, Bud?");
		return;
	}
	else if (Review.name == name.getReviewIdFRomList) {
		alert("User already exists, please select another name");
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

function getStars() {
	var s1='\u2606';
	if (document.getElementById("star_1").checked) {
		return s1+s1+s1+s1+s1;
	}
	else if (document.getElementById("star_2").checked) {
		return s1+s1+s1+s1;
	}
	else if (document.getElementById("star_3").checked) {
		return s1+s1+s1;
	}
	else if (document.getElementById("star_4").checked) {
		return s1+s1;
	}
	else if (document.getElementById("star_5").checked) {
		return s1;
	}
	else {
		return 0; 
	}
}


function getReviewIdFromList() {
	var selectionIndex = document.getElementById("reply_select").selectedIndex;
	
	
	if (selectionIndex == -1) {
		return selectionIndex;
	}
    var id = document.getElementsByTagName("option")[selectionIndex].id;
    for (var i = 0; i < reviews.length; i++) {
    	if (reviews[i].date.toString() == id.substring(7)) {
    		return i;
    	}
    }
}


function populateReplyList() {
	var selectList = document.getElementById("reply_select");
	
	while(selectList.firstChild) {
		selectList.removeChild(selectList.firstChild);
	}
	
	var country = document.getElementsByTagName("body")[0].id;
	for (var i = reviews.length - 1; i >= 0; i--) {
		if (reviews[i].deleted == false && reviews[i].reply == null && reviews[i].country == country) {
			var option = document.createElement("option");
			option.innerHTML = reviews[i].name;
			option.id = "option_" + reviews[i].date.toString();
			selectList.appendChild(option);
		}
	}
}


function buildReview(reviewDiv, review, reply) {
	var time = new Date(review.date);
	var nameAndDate1= document.createElement("h5")
	nameAndDate1.innerHTML= "  This was posted on : "+ time.toLocaleString();
	nameAndDate1.className="nameanddate";
	reviewDiv.appendChild(nameAndDate1);
	var location = document.createElement("div");
	location.className = "location";
	var locationMap = document.createElement("div");
	locationMap.className = "map";
	location.appendChild(locationMap);
        var div2= document.createElement("div");
	div2.className= "rating";
	var deleteButton = document.createElement("button");
	deleteButton.innerHTML = "Delete";
	var delId = "delete_" + review.date.toString();
	deleteButton.id = delId;
	deleteButton.addEventListener("click", function(){
	    deleteReview(delId);
	});
	
	location.appendChild(deleteButton);
	reviewDiv.appendChild(location);
	reviewDiv.appendChild(div2);
	buildDeletedReview(reviewDiv, review, reply);
	
	showMap(review.location, locationMap);
}


function buildDeletedReview(reviewDiv, review, reply) {
	
	var subject = document.createElement("h3");
	var subjectHTML ="Review by : " +review.name + "<br>";
	if (!reply) {
		subjectHTML += "   Ratings: " + review.stars + "";
	}

	subject.innerHTML = subjectHTML;

	reviewDiv.appendChild(subject);
	
	var nameAndDate = document.createElement("p");
	nameAndDate.innerHTML = "Destination: " + review.subject +  "<br>";
	
	reviewDiv.appendChild(nameAndDate);
	var body = document.createElement("blockquote");
	body.innerHTML = review.name+ " says: " + review.body;
	reviewDiv.appendChild(body);
}

function displayReview(review) {
	
	var reviewDiv = document.createElement("h4");
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


