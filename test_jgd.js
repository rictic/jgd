var TripleStore = require("./src/TripleStore").TripleStore;
var sys = require("sys");
var fs = require("fs");
sys.puts("\n\n")

var ts = new TripleStore();
debug(ts.add_node("bob"))
debug(ts.nodes);
ts.add_node("fred");
ts.add_link([":bob","friend",":fred"])
debug(ts.nodes)
var queries = [
[{"id":null}],
[{"id":null,"name":null}],
[{"id":null,"knows":{"id":":mary"}}]
// [{id:null, name:null, '/film/film/starring':{'/film/performance/actor':[{"name":"Humphrey Bogart"}]}}]
]

var test_data = [
"test1.jgd",
"test2.jgd"
]

var all = new TripleStore();
var stores = test_data.map(function(filename) {
    var ts = new TripleStore();
    var data = JSON.parse(fs.readFileSync(filename));
    ts.load_json(data);
    all.load_json(data);
    sys.puts(filename + ":");
    debug(ts,null,2);
    sys.puts("\n")
    return ts;
})
stores.push(all);

queries.forEach(function(query) {
    sys.puts("query: " + JSON.stringify(query));
    stores.forEach(function(ts) {
        debug(ts.MQL(query));
    })
    sys.puts("");
})

function debug(val) {
    sys.puts(JSON.stringify(val, null, 2));
}

sys.puts("\n\n\nOk");
