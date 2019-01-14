// images
'use strict';
var images = (function() {
  // cache
  var image = document.getElementById('modal-image-img');
  var link = document.getElementById('modal-image-link');
  var hash = '#dialog-image';

  function init() {
    var images = _scrapeImages();
    _wrapImages(images);
  }

  function _scrapeImages() {
    var images = document.getElementsByTagName('img');
    var output = []
    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      if (image.parentElement.tagName !== 'A') {
        output.push(image);

      }
    }
    return output;
  }

  function _wrapImages(images) {
    for (var i = 1; i < images.length; i++) {
      var image = images[i]
      var wrapper = document.createElement('a');
      var src = image.getAttribute('src');
      wrapper.setAttribute('href', 'javascript:void(0)');
      image.parentNode.insertBefore(wrapper, image);
      wrapper.appendChild(image);
      document.images[i].addEventListener("click", _displayRoute, false);
    }
  }

  function _displayRoute() {
    var src = this.src;
    if (!src) return;
    progress.track('viewed modal image ' + src);
    modals.toggle('modal-image', 'dialog');
    link.setAttribute('href', src);
    image.setAttribute('src', src);
  }

  return {
    init: init
  };
})();