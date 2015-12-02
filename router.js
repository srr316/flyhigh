/**
 * http://usejsdoc.org/
 */

function route(handle, pathname, response, postData) {
	var logTime = new Date();
	console.log(logTime.toLocaleString() + ": Routing request for " + pathname);
	
	//If there is post data send to post handler
	if (postData != "") {
		handle.post(pathname, response, postData);
	}
	
	//route requests for base directory to index.html
	else if (pathname === "/" || pathname === "\\"){
		handle.get("index.html", response, postData);
	}
	
	//otherwise handle path given
	else {
		handle.get(pathname, response, postData);
	}
}

exports.route = route;