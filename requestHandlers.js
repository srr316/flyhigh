/**
 * http://usejsdoc.org/
 */

var path = require("path");
var fs = require('fs');
var reviews = []; //holds reviews array
var lastUpdateTime = new Date();

//handles POST requests
function handlePost(pathname, response, postData) {
	var logTime = new Date();
	console.log(logTime.toLocaleString() + ": Handling POST request: " + pathname);
	
	//handle review/reply submissions
	if (pathname === "/submit") {
		
		var review = JSON.parse(postData);
		
		//if it is a reply, find corresponding review and attach
		if (review.reviewID) {
			for (var i = 0; i < reviews.length; i++) {
				if (reviews[i].date === review.reviewID) {
					reviews[i].reply = review;
					lastUpdateTime = new Date();
					break;
				}
			}
		}
		//else add new review:
		else {
			reviews.push(review);
			lastUpdateTime = new Date();
		}
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.end();
	}
	
	//handle delete request
	else if (pathname === "/delete") {
		//search for matching review or reply to review to delete
		for (var i = reviews.length - 1; i >= 0; i--) {
			if (postData === reviews[i].date.toString()) {
				reviews[i].deleted = true;
				lastUpdateTime = new Date();
				break;
			}
			else if (reviews[i].reply) {
				if (postData === reviews[i].reply.date.toString()){
					reviews[i].reply = null;
					lastUpdateTime = new Date();
					break;
				}
			}			
		}
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.end();
	}
	
	//else indicate change not submitted
	else {
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.end();
	}
}

//handles all file types listed in contentTypes
function handlePath(pathname, response, postData) {
	var logTime = new Date();	
	console.log(logTime.toLocaleString() + ": Handling GET request: " + pathname);
	
	//maps file extensions to MIME content types
	var contentTypes = {};
	contentTypes[".html"] = "text/html";
	contentTypes[".css"] = "text/css";
	contentTypes[".jpg"] = "image/jpeg";
	contentTypes[".png"] = "image/png";
	contentTypes[".js"] = "application/javascript";
	
	//handle request for reviews data
	if (pathname === "/download") {
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.end(JSON.stringify(reviews));
	}
	
	//handle request for review freshness
	else if (pathname === "/refresh") {
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.end(JSON.stringify(lastUpdateTime.getTime()));
	}

	//if not a supported file type
	else if (!contentTypes[path.extname(pathname)]) {
		console.log(logTime.toLocaleString() + ": No request handler found for extension:" + path.extname(pathname));
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not Found");
		response.end();
	}
	else {
		//if first character is '/', remove so that relative pathname is used rather than absolute pathname.
		if (pathname.substring(0,1) === '/') {
			pathname = pathname.substring(1);
		}
		//check if file exists
		fs.stat(pathname, function(err, stats) {
			if (err) {
				console.log(logTime.toLocaleString() + ": File not found:" + pathname);
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.end("404 Not Found");
			}
			else {
				//read file and use anonymous callback function to send response or output error to console. 
				fs.readFile(pathname, function(err, data) {
					if (err) {
						console.log(err);
					}		
					response.writeHead(200, {"Content-Type": contentTypes[path.extname(pathname)]});
					response.end(data);
				});
			}
		});
	}
}

exports.handlePath = handlePath;
exports.handlePost = handlePost;