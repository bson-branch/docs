// router
'use strict';
var router = (function() {
  // listener
  window.addEventListener('hashchange', function(event) {
    modals.clear();
    var hash = _cleanHash(event.target.location.hash);
    _route(hash);
  }, false);

  // private
  function _route(hash) {
    events.publish(hash);
  }
  function _cleanHash(hash) {
    // remove query strings
    return hash.split("?")[0];
  }

  // public
  function init() {
    var hash = _cleanHash(window.location.hash);
    _route(hash);
  }
  function add(hash, func) {
    events.subscribe(hash, func);
  }
  function remove() {
    history.pushState('', document.title, window.location.pathname + window.location.search);
  }
  return {
    add: add,
    remove: remove,
    init: init
  };
})();