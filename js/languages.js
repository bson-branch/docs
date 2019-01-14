// languages
'use strict';
var languages = (function() {
  // cache
  var cache = {
    base: '/pages/apps',
    hash: '#dialog-code',
    pages: {
      ios: {
        path: '/ios',
        button: document.getElementById("modal-code-ios")
      },
      android: {
        path: '/android',
        button: document.getElementById("modal-code-android")
      },
      adobe: {
        path: '/adobe-air',
        button: document.getElementById("modal-code-adobe")
      },
      cordova: {
        path: '/cordova-phonegap-ionic',
        button: document.getElementById("modal-code-cordova")
      },
      mparticleAndroid: {
        path: '/mparticle-android',
        button: document.getElementById("modal-code-mparticle-android")
      },
      mparticleIos: {
        path: '/mparticle-ios',
        button: document.getElementById("modal-code-mparticle-ios")
      },
      titanium: {
        path: '/titanium',
        button: document.getElementById("modal-code-titanium")
      },
      reactNative: {
        path: '/react-native',
        button: document.getElementById("modal-code-react")
      },
      unity: {
        path: '/unity',
        button: document.getElementById("modal-code-unity")
      },
      xamarin: {
        path: '/xamarin',
        button: document.getElementById("modal-code-xamarin")
      }
    }
  }

  // opens up dialog from anchor
  // few: #dialog-code?ios=#configure-branch&android=#initialize-branch
  // all: #dialog-code
  function init() {
    _addRoute()
  }

  function _addRoute() {
    router.add('#dialog-code', function() {
      _displayRoute();
    });
  }

  function _displayRoute() {
    modals.toggle('modal-code', 'dialog');
    for (var key in cache.pages) {
      var value = cache.pages[key];
      var hash = utils.readQueryString(key);
      var all = window.location.hash === cache.hash;

      _resetButton(value.button);
      if (hash) {
        _setButton(value.button, value.path, hash);
      } else if (all) {
        _setButton(value.button, value.path, '');
      }
    }
  }

  function _resetButton(button) {
    button.disabled = true;
    button.classList.add('disabled');
    button.onclick = '';
  }

  function _setButton(button, path, hash) {
    var url = window.location.origin + cache.base + path+ "/#" + hash;
    button.disabled = false;
    button.classList.remove('disabled');
    button.onclick = function (e) {
      window.location.href = url;
    }
  }

  return {
    init: init
  };
})();