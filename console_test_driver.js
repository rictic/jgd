var TripleStore = require("./src/TripleStore").TripleStore;

var failures = [];
var successes = [];
function TestCase(suite_name, tests) {
    for (var name in tests) {
        try {
            tests[name]();
        }
        catch (e) {
            failures.push(new Failure(suite_name, name, e));
            continue;
        }
        successes.push(new Success(suite_name, name));
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
    failures.push(new Failure("toplevel eval error", fn, e));
}

sys.debug(successes.length + " successes, " + failures.length + " failures");
failures.forEach(function(failure) {
    sys.debug(failure);
});
process.exit(failures.length)
