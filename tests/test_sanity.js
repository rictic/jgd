var Promise = require("./promise").Promise;

var t1 = [{
	"id" : ":bob",
	"name" : "Bob",
	"knows" : [":mary", ":sue"]
},
{
	"id" : ":mary",
	"name" : "Mary",
	"knows" : [":sue"]
},
{
	"id" : ":sue",
	"name" : "Sue",
	"knows" : [":mary"]
}]
var t2 = [{
	"id" : "fred",
	"knows" : [":bob", ":mary"],
	"name" : "Fred"
},
{
	"id" : "phil",
	"knows" : [":bob", ":fred"],
	"name" : "Phil"
},
{
	"id" : "bob",
	"knows" : ":phil"
}]
var sys = require("sys")
function test_query(db, query, test_fn) {
    var ts = new TripleStore();
    var p = new Promise();
    

    ts.load_json(db).addCallback(function() {
        ts.MQL(query).addCallback(function(result) {
            try {
                test_fn(result);
            }
            catch(e) {
                p.emitError(e);
                return;
            }
            p.emitSuccess();
        });
    })
    return p;
}

function test_simple(expected, query) {
    return test_query(t1, query, function(result) {
        assertEq(expected, result);
    })
}

TestCase("A few example queries",{
    "test loading a json file": function() {
        var ts = new TripleStore();
        return ts.load_json(t1);
    },
    "test loading both json files": function() {
        var ts = new TripleStore();
        var p = new Promise();
        ts.load_json(t1).addCallback(function() {
            ts.load_json(t2).addCallback(function() {
                p.emitSuccess();
            })
        });
        return p;
    },
    "test fetching ids": function() {
        var query = [{id:null}]
        var expected = [{id:":bob"},{id:":mary"},{id:":sue"}]
        
        return test_simple(expected, query);
    },
    "test fetching names": function() {
        return test_query(t1, [{name:null}], function(result) {
            assertEq([{name:"Bob"},{name:"Mary"},{name:"Sue"}], result);
        })
    },
    "test fetching sub-objects": function() {
        var query = [{knows:[{id:null}]}];
        var expected = [{
            knows:[{id: ":mary"}, {id:":sue"}]
        }
        ,{
            knows:[{id: ":sue"}]
        }
        ,{
            knows:[{id:":mary"}]
        }];
        
        return test_simple(expected, query);
    },
    "test filling in names of sub-objects": function() {
        var query = [{knows:[{id:null, name:null}]}];
        var expected = [{
            knows:[{id: ":mary", name: "Mary"}, {id:":sue", name: "Sue"}]
        }
        ,{
            knows:[{id: ":sue", name: "Sue"}]
        }
        ,{
            knows:[{id:":mary", name: "Mary"}]
        }];
        
        return test_simple(expected, query);
    },
    "test querying a combined TripleStore": function() {
        var ts = new TripleStore();
        var p = new Promise();
        ts.load_json(t1).addCallback(function() {
            ts.load_json(t2).addCallback(function() {
                ts.MQL([{name:null, knows:{id:":mary"}}]).addCallback(function(result) {
                    try {
                        assertSubsetOf(result, [{name: "Bob"}, {name: "Sue"}, {name: "Fred"}])                    
                    }
                    catch(e) {p.emitError(e);}
                    p.emitSuccess();
                    
                })
            })
        });
        return p;
    }
});