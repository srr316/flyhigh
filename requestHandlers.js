/**
 * 
 */
var exec = require("child_process").exec;
var querystring = require("querystring");
  fs = require("fs");

function start(response, postData){
	console.log("Request handler 'start' was called");
	
	fs.readFile("index.html", "binary", function(error, file){
		if(error){
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(err + "\n");
			response.end();
		}else{
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write(file, "binary");
			response.end();
		}
	});

}

function upload(response, postData){
	console.log("request handler 'upload' was called");
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("You've sent " + querystring.parse(postData).text);
	response.end();
}

function show(response, postData){
	console.log("request handler 'show' was called.");
	fs.readFile("/tmp/test.jpeg", "binary", function(error, file){
		if(error){
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(err + "\n");
			response.end();
		}else{
			response.writeHead(200, {"Content-Type": "image/jpeg"});
			response.write(file, "binary");
			response.end();
		}
	});
}

exports.start = start;
exports.upload = upload;
exports.shiw = show;