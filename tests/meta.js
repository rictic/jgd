//define and test our testing helpers


//fill in
/** @type {function(...)} */
function p(){}
/** @type {function(...)} */
function log(){}

var console = ('console' in this) ? this['console'] : {};

console.options = {SKIP_FUNCTIONS: true, SKIP_INHERITED: true};

function pass() {
    assertTrue(true);
}


/** @param {*} msg
  * @param {*} a1
  * @param {*=} a2
  */
function assertEq(msg, a1, a2) {
    if (arguments.length == 2){
        a2 = a1;
        a1 = msg;
        msg = "";
    }
    var message = areNotEq(a1,a2);
    if (message){
        p(a1);
        log("expected, but found");
        p(a2);
        fail(msg + " " + message);
    }
    else
        pass();
}

/** @param {*} msg
  * @param {*} a1
  * @param {*=} a2
  */
function assertNotEq(msg, a1, a2) {
    if (arguments.length == 2){
        a2 = a1;
        a1 = msg;
        msg = "";
    }
    var message = areNotEq(a1,a2);
    if (message) {
        pass();
    }
    else {
        p(a1);
        log("should not be equal to");
        p(a2);
        fail();
    }
}

function isArray(obj) {
	return Object.prototype.toString.call(obj) === "[object Array]";
}

function isObject(val) {
    if (isArray(val)) return false;
    if (typeof val != "object") return false;
    return true;
}

/** @param {*} msg
  * @param {*} o1
  * @param {*=} o2
  */
function assertSubsetOf(msg, o1, o2) {
    if (arguments.length == 2){
        o2 = o1;
        o1 = msg;
        msg = "";
    }
    var result = isNotSubsetOf(o1,o2);
    if (result){
        log(o1);
        log("is not a subset of");
        log(o2);
        fail(msg + " " + result);
    }
    else
        pass();
}

function isNotSubsetOf(o1,o2) {
    if (!isObject(o2))
        return areNotEq(o1,o2,isNotSubsetOf, isNotSubsetOf);
    
    for (var prop in o2){
        var message = areNotEq(o1[prop],o2[prop],isNotSubsetOf, isNotSubsetOf);
        if (message)
            return o1 + " and " + o2 + " differ in prop `" + prop + "': " + message;
    }
}

/** @param {*} a1
  * @param {*} a2
  * @param {function(*,*):string=} cmpFunc
  * @param {function(*,*):string=} objCompFunc
  */
function areNotEq(a1,a2, cmpFunc, objCompFunc){
    cmpFunc = cmpFunc || areNotEq;
    objCompFunc = objCompFunc || objComp;
    if (isArray(a1) || isArray(a2)){
        if (!(isArray(a1) && isArray(a2)))
            return "one is an array, the other isn't: " + a1 + " " + a2;

        var ar1 = /** @type {Array} */ (a1);
        var ar2 = /** @type {Array} */ (a2); 


        if (ar1.length != ar2.length) return "lengths of arrays were different, expected " + ar1.length + " got " + ar2.length + ": " + ar1 + " " + ar2;
        for (var i = 0; i < ar1.length; i++){
            var message = cmpFunc(ar1[i], ar2[i], cmpFunc, objCompFunc);
            if (message)
                return i + "th value different in arrays: " + message;
        }
        return;
    }
    if (a1 == a2) return;
    if (typeof a1 != typeof a2) return "differently typed: " + a1 + " " + a2;
    if (typeof a1 != "object")
        return "Expected " + a1 + " but got " + a2;
    
    return objCompFunc(a1, a2, cmpFunc, objCompFunc);
}

function objComp(a1, a2, cmpFunc, objCompFunc) {
    if ("equals" in a1)
        if (a1.equals(a2))
            return;
        else
            return "Expected " + a1 + " but got " + a2;

    for (var prop in a1){
        var message = cmpFunc(a1[prop],a2[prop], cmpFunc, objCompFunc);
        if (message)
            return a1 + " and " + a2 + " differ in prop `" + prop + "': " + message;
    }
    for (var prop in a2){
        var message = cmpFunc(a1[prop],a2[prop], cmpFunc, objCompFunc);
        if (message)
            return a1 + " and " + a2 + " differ in prop `" + prop + "': " + message;
    }
}

TestCase("MetaTest",{
    testIntEq: function() {
        assertEq("one is one",1,1);
    },
    testStringEq: function() {
        assertEq("'a' is 'a'",'a','a');
    },
    testBooleanEq: function() {
        assertEq("true is true",true,true);
        assertEq("false is false",false,false);
    },
    testArrayEq: function() {
        assertEq("empty list is empty list",[],[]);
        assertEq("[1,2,3] is [1,2,3]",[1,2,3],[1,2,3]);
    },
    testObjEq:function() {
        assertEq("{} is {}",{},{});
        assertEq("{a:1} is {a:1}",{a:1},{a:1});
        assertEq("{a:[1,2,3]} is {a:[1,2,3]}",{a:[1,2,3]},{a:[1,2,3]});
    },
    testObjNotEq:function() {
        assertNotEq("[1] is not 1",[1],1);  
    }
});
