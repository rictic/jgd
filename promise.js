function Promise() {}
Promise.prototype = new process.EventEmitter();
Promise.prototype.addCallback = function(f) { this.addListener("success", f); }
Promise.prototype.addErrback = function(f) { this.addListener("error", f); }
Promise.prototype.emitSuccess = function() { this.emit.apply(this, ["success"].concat(Array.prototype.slice.call(arguments)))}
Promise.prototype.emitError = function() { this.emit.apply(this, ["error"].concat(Array.prototype.slice.call(arguments)))}

function PromiseGroup(promises) {
  var promise = new Promise();
  var promiseLen = promises.length;
  var responses = {}; // holds values and their position, 
                    // we don't know what order they will finish
 
  promises.forEach(function(p, position) {
    p.addCallback(function(value) {
      promises.shift();
      responses[position] = value;
      if(promises.length == 0) {
        var sortedResponses = [];
        for(var i = 0; i < promiseLen; ++i) {
          sortedResponses.push(responses[i])
        }
        promise.emitSuccess(sortedResponses);
      }
    });
    p.addErrback(function() {
      promise.emitError(arguments);
    })
  });

  this.promise = promise;
}

exports.Promise = Promise;
exports.PromiseGroup = PromiseGroup;
