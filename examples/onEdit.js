function captureEdits(textarea, onEdit, eachChange){
    var capture_tab = function(event) {
        if (event.keyCode == 9) {
            if (event.type === "keydown")
                textarea.insertAtCaret("\t");
            event.returnValue = false;
            return false;
        }
        return true;
    }
    textarea.keypress(capture_tab).keydown(capture_tab);

    var inputThrottler = throttler(eachChange, onEdit);
    var harmlessKeys = new Set([37,38,39,40,91,93,20,35,36,33,34,27,18,17,16,224]);
    textarea.keyup(inputFilterer).keydown(inputFilterer);
	textarea.bind("paste", null, inputThrottler);
	//for IE
	textarea[0].onpaste = inputThrottler;
    //for most everyone else's browsers
	textarea[0].oninput = inputThrottler;
    if (textarea.val() != "") inputThrottler();

    var inputFilterer = function(event) {
        if (harmlessKeys.contains(event.keyCode))
            return;
        //ctrl-a or cmd-a
        if ((event.metaKey || event.ctrlKey) && event.keyCode === 65)
            return;
        inputThrottler();
    }
}

/** Returns a function that calls `every()` each time it is called,
   but only calls `rarely()` at most once per `minimumTimeBetween` milliseconds. 
   
   Useful for handling events on rapidly changing input elements,
   
   @param {function()} every
   @param {function()} rarely
   @param {number=} minimumTimeBetween
   @return {function()}
*/
function throttler(every, rarely, minimumTimeBetween) {
    var timeout = minimumTimeBetween || 250;
    var waiter = null;
    var againAfterWaiting = false;
    return function() {
        every();
        if (waiter === null) {
            rarely();
            waiter = setTimeout(function() {
                waiter = null;
                if (againAfterWaiting)
                    rarely();
                againAfterWaiting = false;
            }, timeout);
        }
        else
            againAfterWaiting = true;
    }
}

/** @constructor 
  * @param {Array=} initial_vals the initial elements of the set
  */
var Set = function(initial_vals) {
    var set = {};
    this.add = function(val) {set[val] = true;};
    this.addAll = function(array) {
        for(var i = 0; i < array.length; i++) 
            this.add(array[i]);
    }
    this.remove = function(val) {delete set[val]}
    this.contains = function(val) {return val in set;};
    //getAll only valid for 
    this.getAll = function() {var all = []; for (var val in set) all.push(val); return all;};
    this.addAll(initial_vals);
}
