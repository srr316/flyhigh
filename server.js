/**
 * http://usejsdoc.org/
 */

var http = require("http");
var url = require("url");

function start(route, handle) {
	function onRequest(request, response) {
		var postData = "";
		var pathname = url.parse(request.url).pathname;
		console.log("Server request for " + pathname + " received.");
		
		request.setEncoding("utf8");
		
		request.addListener("data", function(postDataChunk) {
			postData += postDataChunk;
			console.log(logTime.toLocaleString() + ": Received POST data chunk '" + postDataChunk + "'.");
		});
		
		request.addListener("end", function() {
			route(handle, pathname, response, postData);
		});		
	}

	http.createServer(onRequest).listen(3331);
	console.log("Server has started on port 3331.");
}

exports.start = start;