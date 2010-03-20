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
        ts.load_json(t1);
    },
    "test loading both json files": function() {
        var ts = new TripleStore(t1);
        ts.load_json(t2);
    },
    "test fetching ids": function() {
        var ts = new TripleStore(t1);
        assertEq([{id:":bob"},{id:":mary"},{id:":sue"}], ts.MQL([{id:null}]))
    },
    "test fetching names": function() {
        var ts = new TripleStore(t1);
        assertEq([{name:"Bob"},{name:"Mary"},{name:"Sue"}], ts.MQL([{name:null}]))
    },
    "test fetching sub-objects": function() {
        var ts = new TripleStore(t1);
        var expected = [{
            knows:[{id: ":mary"}, {id:":sue"}]
        },{
            knows:[{id: ":sue"}]
        },{knows: [{id:":mary"}]}]
        assertEq(expected, ts.MQL([{knows:[{id:null}]}]))
    },
    "test filling in names of sub-objects": function() {
        var ts = new TripleStore(t1);
        var expected = [{
            knows:[{id: ":mary", name: "Mary"}, {id:":sue", name: "Sue"}]
        },{
            knows:[{id: ":sue", name: "Sue"}]
        },{knows: [{id:":mary", name: "Mary"}]}]
        assertEq(expected, ts.MQL([{knows:[{id:null, name:null}]}]))
    },
    "test querying a combined TripleStore": function() {
        var ts = new TripleStore(t1);
        ts.load_json(t2);
        assertSubsetOf(ts.MQL([{name:null, knows:{id:":mary"}}]), [{name: "Bob"}, {name: "Sue"}, {name: "Fred"}])
    }
});