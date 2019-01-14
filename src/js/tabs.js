// code tabs
'use strict';
var tabs = (function() {
  var scrape = (function() {
    // properties
    var minCodeSnippets = 1;

    // private
    function _getCodeGroupItems(group) {
      // scan li elements of code group
      var sections = group.children;
      var contents = [];
      var codeSnippets = 0;
      for (var j = 0; j < sections.length; j++) {
        var section = sections[j];
        var elements = section.children;
        var snippet = _getCodeGroupItemsCodeAndTitle(elements);

        // if valid title and code, then section needs to be converted
        if (snippet.title && snippet.code) {
          contents.push({
            valid: true,
            title: snippet.title,
            code: snippet.code
          });
          codeSnippets++;
        } else {
          contents.push({
            valid: false,
            code: section,
          });
        }
      }
      return {
        contents: contents,
        codeSnippets: codeSnippets
      };
    }

    function _getCodeGroupItemsCodeAndTitle(elements) {
      // scan elements within li
      var title = null;
      var code = null;
      for (var k = 0; k < elements.length; k++) {
        // early exit
        var element = elements[k];
        if (!element.firstElementChild) break;

        // has both title and code
        title = element.firstElementChild.tagName === 'EM' ? element.firstElementChild.innerHTML : title;
        code = element.classList.contains('codehilite') ? element : code;
      }
      return {
        code: code,
        title: title
      };
    }

    // public
    function getCodeGroups() {
      // scan code groups
      var codeGroups = {};
      var groups = 0;
      var codes = document.getElementsByClassName('codehilite');
      for (var i = 0; i < codes.length; i++) {
        // early exit if group of code snippets already viewed
        var code = codes[i];
        var group = code.parentElement.parentElement;
        if (group.hasAttribute('data-parsed')) continue;
        group.setAttribute('data-parsed', true);
        groups++;

        // get code group items
        var codeGroupItems = _getCodeGroupItems(group);

        // determine if a valid code group
        if (codeGroupItems.codeSnippets > minCodeSnippets) {
          codeGroups[i] = {
            group: group,
            sections: codeGroupItems.contents,
            codeSnippets: codeGroupItems.codeSnippets
          };
        }
      }
      return codeGroups;
    }

    return {
      getCodeGroups: getCodeGroups
    };
  })();

  var format = (function() {
    // private
    function _generateCodeSection(type) {
      var output = document.createElement('div');
      output.setAttribute('class', 'tab-code-' + type);
      return output;
    }

    function _generateHtmlCodeSectionItem(type, data, index) {
      var output = null;
      var classes = null;
      if (type === 'button') {
        output = document.createElement('button');
        classes = (index == 0) ? 'tab-code-button active' : 'tab-code-button';
        output.setAttribute('type', 'button');
        output.innerHTML = data;
      } else {
        output = document.createElement('div');
        classes = (index == 0) ? 'tab-code-content active' : 'tab-code-content';
        output.appendChild(data);
      }
      output.setAttribute('class', classes);
      output.setAttribute('data-code-id', index);
      return output;
    }

    function _generateHtmlCodeSectionSeparator(index) {
      var output = document.createElement('span');
      output.setAttribute('class', 'tab-code-separator');
      output.innerHTML = '|';
      return output;
    }

    function _generateCodeContainer(index, codes) {
      var list = document.createElement('li');

      var container = document.createElement('div');
      container.setAttribute('class', 'tab-code-section');
      container.setAttribute('data-code-section', index);

      var buttons = _generateCodeSection('buttons');
      var contents = _generateCodeSection('contents');

      for (var l = 0; l < codes.length; l++) {
        var block = codes[l];
        var button = _generateHtmlCodeSectionItem('button', block.title, l);
        var content = _generateHtmlCodeSectionItem('content', block.code, l);
        var separator = _generateHtmlCodeSectionSeparator(l);
        buttons.appendChild(button);
        if (l != codes.length-1) {
          buttons.appendChild(separator);
        }
        contents.appendChild(content);
      }
      list.appendChild(container);
      container.appendChild(buttons);
      container.appendChild(contents);

      return list;
    }

    // public
    function transformCodeGroups(data) {
      // each group
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var block = data[key];
          var codes = [];
          var codeContainer = null;

          // clear html
          block.group.innerHTML = '';

          // each section of group
          for (var i = 0; i < block.sections.length; i++) {
            var section = block.sections[i];
            if (section.valid) {
              codes.push(section);
            } else {
              // append html
              if (codes.length > 0) {
                codeContainer = _generateCodeContainer(key, codes);
                block.group.appendChild(codeContainer);
                codes = [];
              }
              block.group.appendChild(section.code);
            }
          }

          if (codes.length > 0) {
            // append html
            codeContainer = _generateCodeContainer(key, codes);
            block.group.appendChild(codeContainer);
          }
        }
      }
    }
    return {
      transformCodeGroups: transformCodeGroups
    };
  })();

  var activate = (function() {
    // cache
    var sections = {};

    // private
    function _mapElementToObject(object, list, value) {
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var section = item.parentElement.parentElement.getAttribute('data-code-section');
        var id = item.getAttribute('data-code-id');
        if (!object[section]) {
          object[section] = {};
        }
        if (!object[section][id]) {
          object[section][id] = {};
        }
        object[section][id][value] = item;
      }
      return object;
    }

    function _mapButtonToSection(object) {
      for (var sectionId in object) {
        if (object.hasOwnProperty(sectionId)) {

          var section = object[sectionId];
          for (var codeId in section) {
            if (section.hasOwnProperty(codeId)) {
              var group = section[codeId];
              _handleListenerClosure(group, codeId, section);
            }
          }
        }
      }
    }

    function _handleListenerClosure(group, codeId, section) {
      group.button.addEventListener('click', function() {
        _toggleSection(codeId, section);
      });
    }

    function _toggleSection(codeId, section) {
      for (var id in section) {
        if (section.hasOwnProperty(id)) {
          var group = section[id];
          if (id === codeId) {
            group.button.classList.add('active');
            group.content.classList.add('active');
          } else {
            group.button.classList.remove('active');
            group.content.classList.remove('active');
          }
        }
      }
    }

    // public
    function enableCodeGroups() {
      var buttons = document.getElementsByClassName('tab-code-button');
      var contents = document.getElementsByClassName('tab-code-content');
      _mapElementToObject(sections, buttons, 'button');
      _mapElementToObject(sections, contents, 'content');
      _mapButtonToSection(sections);
    }

    return {
      enableCodeGroups: enableCodeGroups
    };
  })();

  function init() {
    var data = scrape.getCodeGroups();
    format.transformCodeGroups(data);
    activate.enableCodeGroups();
  }

  return {
    init: init
  };
})();