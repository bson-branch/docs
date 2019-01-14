// buttons
'use strict';
var buttons = (function() {
  // properties
  var buttons = {
    support: {
      url: _getSupportUrl(),
      buttons: document.getElementsByClassName('contact-support'),
      example: '<a href="#" class="contact-support" title="Contact support">Contact support</a>',
    },
    improve: {
      url: _getImproveUrl(),
      buttons: document.getElementsByClassName('improve-doc'),
      example: '<a href="#" class="improve-doc" title="Improve This Doc">Improve this docs</a>',
    }
  };

  // private
  function _getSupportUrl() {
    return 'mailto:integrations@branch.io?subject=I need some assistance&body=Hello Branch,%0A%0AI am viewing (' + window.location.href + ').%0A%0AMy Branch App ID (https%3A%2F%2Fdashboard.branch.io%2Faccount-settings%2Fapp) is:%0A%0A I need assistance with ';
  }
  function _getImproveUrl() {
    var trim = window.location.pathname.replace(/^\/|\/$/g, '').split('/');
    trim = trim[0] === 'docs' ? trim.slice(1, trim.length).join('/') : trim.join('/');
    var path = (trim === '') ? 'index' : trim;
    return 'https://github.com/branchmetrics/docs/edit/master/src/' + path + '.md' + '?description=Click%20on%20->%20"Propose%20file%20change"%20->%20"Create%20pull%20request"%20->%20"Create%20pull%20request"%20->%20to%20submit%20your%20changes.';
  }

  // public
  function init() {
    for (var key1 in buttons) {
      if (buttons.hasOwnProperty(key1)) {
        var button = buttons[key1];
        for (var key2 in button) {
          if (button.hasOwnProperty(key2)) {
            var value = button[key2];
            if (key2 === 'buttons') {
              for (var i = 0; i < value.length; i++) {
                var element = value[i];
                element.setAttribute('href', button.url);
                progress.track('pressed button ' + key1);
              }
            }
          }
        }
      }
    }
  }
  function contact(button) {
    window.location.href = buttons.button.url;
  }
  return {
    init: init,
    contact: contact
  };
})();
