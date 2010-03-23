var Promise = require("../promise").Promise;

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
        var ts = new TripleStore();
        var p = ts.load_json(t1);
        p.addCallback(function() {
            assertEq([{id:":bob"},{id:":mary"},{id:":sue"}], ts.MQL([{id:null}]))
        })
        return p;
    },
    "test fetching names": function() {
        var ts = new TripleStore();
        var p = ts.load_json(t1);
        p.addCallback(function() {
            assertEq([{name:"Bob"},{name:"Mary"},{name:"Sue"}], ts.MQL([{name:null}]))
        });
        return p;
    },
    "test fetching sub-objects": function() {
        var ts = new TripleStore();
        var p = ts.load_json(t1);
        var expected = [{
            knows:[{id: ":mary"}, {id:":sue"}]
        },{
            knows:[{id: ":sue"}]
        },{knows: [{id:":mary"}]}]

        p.addCallback(function() {
            assertEq(expected, ts.MQL([{knows:[{id:null}]}]))
        });
        return p;
    },
    "test filling in names of sub-objects": function() {
        var expected = [{
            knows:[{id: ":mary", name: "Mary"}, {id:":sue", name: "Sue"}]
        },{
            knows:[{id: ":sue", name: "Sue"}]
        },{knows: [{id:":mary", name: "Mary"}]}]

        var ts = new TripleStore();
        var p = ts.load_json(t1);
        p.addCallback(function() {
            assertEq(expected, ts.MQL([{knows:[{id:null, name:null}]}]))
        });
        return p;
    },
    "test querying a combined TripleStore": function() {
        var ts = new TripleStore();
        var p = new Promise();
        ts.load_json(t1).addCallback(function() {
            ts.load_json(t2).addCallback(function() {
                try {
                    assertSubsetOf(ts.MQL([{name:null, knows:{id:":mary"}}]), [{name: "Bob"}, {name: "Sue"}, {name: "Fred"}])                    
                }
                catch(e) {p.emitError(e);}
                p.emitSuccess();
            })
        });
        return p;
    }
});