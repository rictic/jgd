var TripleStore = require("../src/TripleStore").TripleStore;
var promise = require("./promise");


var failures = [];
var successes = [];
var promises = [];
function TestCase(suite_name, tests) {
    for (var n in tests) {
    (function(name) {
            
        try {
            var result = tests[name]();
        }
        catch (e) {
            add_failure(e);
            continue;
        }
        if (result && result.addCallback) {
            var p = new promise.Promise();
            promises.push(p);
            result.addCallback(function() {
                add_success();
                p.emitSuccess();
            });
            if (result.addErrback)
                result.addErrback(function(e) {
                    add_failure(e);
                    p.emitSuccess();
                });
        }
        else
            add_success();

        function add_failure(e) { failures.push(new Failure(suite_name, name, e)) }
        function add_success() { successes.push(new Success(suite_name, name)) }
    })(n)
    }
}

function Success(suite, test) {
}

function Failure(suite, test, error) {
    this.suite = suite; this.test = test; this.error = error;
}
Failure.prototype.toString = function() {
    var r = this.suite + "." + this.test + " FAILED: ";
    if (!this.error) return r;
    if (this.error.message)
        r += this.error.message + "\n";
    if (this.error.stack)
        r += this.error.stack + "\n";
    return r;
}

function assertTrue(t, msg) {if (!t) throw new Error(msg || "assertTrue failed, found false")}
function fail(msg) { throw new Error(msg || "fail() called")}

var sys = require("sys")
var fs = require("fs")
var test_files = process.argv.slice(2);
var test_text = "";
test_files.forEach(function(fn) {
    test_text += "\n" + fs.readFileSync(fn);
});
try {
    eval(test_text);
} catch(e) {
    failures.push(new Failure("toplevel eval error", "-", e));
}

var pg = new promise.PromiseGroup(promises);
pg.promise.addCallback(function() {
    sys.debug(successes.length + " successes, " + failures.length + " failures");
    failures.forEach(function(failure) {
        sys.debug(failure);
    });
    process.exit(failures.length)
})
pg.promise.addErrback(function(e) {
    sys.debug("an error occurred:" + JSON.stringify(e));
})

setTimeout(function() {
    sys.debug("Timeout reached");
    process.exit(128);
}, 5000);