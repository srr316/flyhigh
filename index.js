/**
 * http://usejsdoc.org/
 */

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle.get = requestHandlers.handlePath;
handle.post = requestHandlers.handlePost;

server.start(router.route, handle);