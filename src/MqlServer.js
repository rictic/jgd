var url = require("url");
var querystring = require("querystring");
var sys = require('sys');
var ejsgi = require("ejsgi")
    
function MqlServer(ts) {
    this.ts = ts;
}

MqlServer.prototype.start = function(host, port) {
    var self = this;
    this.server = ejsgi.Server(errorHandlingMiddleware(jsonpMiddleware(jsonMiddleware(app))), host, port);
    this.server.start();
    sys.puts("MqlServer running at http://" + host + ":" + port + "/");
    
    function app(req) {
        return self.handler(req);
    }
}

function getParams(path) {
    return querystring.parse(url.parse(decodeURIComponent(path)).query)
}

MqlServer.prototype.handler = function(req) {
    var params = getParams(req.url);
    //this is silly
    if (!('query' in params))
        return "not found";
    var query = JSON.parse(params.query).query;
    return this.ts.MQL(query);
}

MqlServer.prototype.stop = function() {
    this.server.stop();
}

function errorHandlingMiddleware(app) {
    return function(req) {
        try {
            return app(req);
        }
        catch (e) {
            var message = e.stack || e.message || JSON.stringify(e);
            var out = {
                status: 500, 
                headers: {
                    "content-type" : "text/plain",
                    "content-length" : message.length
                },
                body: new (req.jsgi.stream)
            }
            out.body.write(message);
            out.body.close()
            return out;
        }
    }
}

function jsonMiddleware(app) {
    return function(req) {
        var result = app(req);
        var message = JSON.stringify({
            status: "200 OK",
            code: "/api/status/ok",
            result: result
        }, null, 2);
        var out = { body : new (req.jsgi.stream) };
        out.status = 200;
        out.headers = {
          "content-type" : "application/json",
          "content-length" : message.length
        };
        out.body.write(message);
        out.body.close();
        return out;
    }
}

function jsonpMiddleware(app) {
    return function(req) {
        var params = getParams(req.url);
        var out = app(req);
        if (!('callback' in params) || out.headers['content-type'] !== "application/json")
            return out;
        var jsonBody = out.body;
        out.body = new (req.jsgi.stream);
        out.headers['content-type'] = "text/javascript";
        if (out.headers['content-length'] !== undefined)
            out.headers['content-length'] += params.callback.length + 2;
        out.body.write(params['callback'] + '(');
        jsonBody.addListener("data", function(data) {out.body.write(data);})
        jsonBody.addListener("end", function() {out.body.write(')'); out.body.close();})
        out.body.addListener("pause", function() {jsonBody.pause();})
        out.body.addListener("resume", function() {jsonBody.resume();})
        out.body.addListener("drain", function() {jsonBody.emit("drain");})
        return out;
    }
    
}

exports.MqlServer = MqlServer;