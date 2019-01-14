// pub sub
'use strict';
var events = (function() {
  // properties
  var items = {};
  // methods
  function publish(name, data) {
    if (items[name]) {
      items[name].forEach(function(func) {
        func(data);
      });
    }
  }
  function subscribe(name, func) {
    items[name] = items[name] || [];
    items[name].push(func);
  }
  function unsubscribe(name, func) {
    if (items[name]) {
      for (var i = 0; i < items[name].length; i++) {
        if (items[name][i] === func) {
          items[name].splice(i, 1);
          break;
        }
      }
    }
  }
  // public
  return {
    items: items,
    publish: publish,
    subscribe: subscribe,
    unsubscribe: unsubscribe
  };
})();