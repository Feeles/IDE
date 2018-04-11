/*global requirejs define domtoimage EventEmitter2 feeles*/ !(function () {
  // An array of stocks for feeles.export
  feeles.exports = [];

  var getUniqueId = (function (id) {
    return function () {
      return 'FEELES_UNIQ_ID-' + ++id;
    };
  })(0);

  /**
   * @return Promise ({ port, model })
   */
  var connected = (feeles.connected = new Promise(function (resolve) {
    window.addEventListener('message', function (event) {
      if (event.source === window || event.ports.length < 1) return;

      resolve({
        port: event.ports[0],
        model: event.data
      });
    });
  }));

  // Connect
  connected
    .then(function (_ref) {
      var port = _ref.port;

      port.onmessage = function (e) {
        switch (e.data.query) {
          case 'shot':
            {
              var decls = declarateVars(feeles.exports);
              var text =
                (decls.length ?
                  'var ' +
                  decls
                  .map(function (decl) {
                    return (
                      decl.propName +
                      '=feeles.exports[' +
                      decl.index +
                      ']["' +
                      decl.propName +
                      '"]'
                    );
                  })
                  .join(',') +
                  ';' :
                  '') + e.data.value.text;

              // feeles/eval.js があるかどうか調べる
              feeles
              .resolve('feeles/eval')
              .then(function () {
                // feeles/eval.js が存在する
                requirejs(
                  ['feeles/eval'],
                  function (module) {
                    if (module && typeof module.default !== 'function') {
                      var mes =
                        'feeles/eval.js is found but not export function';
                      throw new Error(mes);
                    }
                    // もし "feeles/eval.js" があれば,
                    // default export された function に text を与えてコールする
                    module.default(text);
                  },
                  function () {
                    // なければ直接 eval する
                    eval(text);
                  }
                );
              })
              .catch(function () {
                // なければ直接 eval する
                eval(text);
              });

              window.focus();
              break;
            }
          case 'capture':
            {
              // Screen Shot
              var canvas = document.querySelector('canvas');
              if (canvas) {
                port.postMessage({
                  query: e.data.query,
                  id: e.data.id,
                  value: canvas.toDataURL(e.data.type)
                });
              } else {
                var bgcolor = getComputedStyle(document.body).backgroundColor;
                var params = {
                  bgcolor: bgcolor,
                  width: window.innerWidth,
                  height: window.innerHeight
                };
                var promise =
                  e.data.type === 'image/jpeg' ?
                  domtoimage.toJpeg(document.body, params) :
                  domtoimage.toPng(document.body, params);
                promise.then(function (dataURL) {
                  port.postMessage({
                    query: e.data.query,
                    id: e.data.id,
                    value: dataURL
                  });
                });
              }
              break;
            }
          case 'ipcRenderer.emit':
            {
              feeles.ipcRenderer.emit.apply(feeles.ipcRenderer, e.data.value);
              break;
            }
        }
      };
    })
    .catch(function (err) {
      return console.info('feeles: Error in launch', err);
    });

  feeles.fetch = function (name) {
    return requestPostMessage('fetch', name, function (event) {
      if (event.data.error) {
        event.reject('Error in feeles.fetch in ' + name);
      } else {
        event.resolve(new Response(event.data.value));
      }
    });
  };

  feeles.fetchDataURL = function (name) {
    return requestPostMessage('fetchDataURL', name, function (event) {
      if (event.data.error) {
        event.reject('Error in feeles.fetchDataURL in ' + name);
      } else {
        event.resolve(event.data.value);
      }
    });
  };

  feeles.resolve = function (name) {
    return requestPostMessage('resolve', name, function (event) {
      if (event.data.error) {
        event.reject('Error in feeles.resolve in ' + name);
      } else {
        event.resolve(event.data.value);
      }
    });
  };

  feeles.saveAs = function (blob, name) {
    return requestPostMessage('saveAs', [blob, name], function (event) {
      if (event.data.error) {
        event.reject('Error in feeles.saveAs in ' + name);
      } else {
        event.resolve(event.data.value);
      }
    });
  };
  feeles.reload = function () {
    return requestPostMessage('reload');
  };
  feeles.replace = function (url) {
    return requestPostMessage('replace', url);
  };

  feeles.openReadme = function (fileName) {
    return requestPostMessage('readme', fileName || '');
  };
  feeles.closeReadme = function () {
    return requestPostMessage('readme', null);
  };
  feeles.openMedia = function (params) {
    return requestPostMessage('media', params);
  };
  feeles.closeMedia = function () {
    return requestPostMessage('media', null);
  };
  feeles.openCode = function (fileName) {
    return requestPostMessage('code', fileName);
  };
  feeles.closeCode = function () {
    return requestPostMessage('code', null);
  };
  feeles.openEditor = function (fileName) {
    return requestPostMessage('editor', fileName);
  };
  feeles.closeEditor = function () {
    return requestPostMessage('editor', null);
  };
  feeles.setAlias = function (name, ref) {
    if (typeof feeles.exports[0] !== 'object') {
      // Backward compatibility
      feeles.exports[0] = {};
    }
    feeles.exports[0][name] = ref;
    var propNames = declarateVars(feeles.exports).map(function (decl) {
      return decl.propName;
    });
    return requestPostMessage('complete', propNames);
  };

  var SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    feeles.SpeechRecognition = class PseudoSpeechRecognition extends SpeechRecognition {
      start() {
        var self = {
          lang: this.lang,
          continuous: this.continuous,
          interimResults: this.interimResults,
          maxAlternatives: this.maxAlternatives,
          serviceURI: this.serviceURI,
          grammars: this.grammarsArray
        };
        requestPostMessage(
          'api.SpeechRecognition',
          self,
          function (e) {
            var event = new Event(e.data.type);
            for (var key in e.data.event) {
              if (e.data.event.hasOwnProperty(key)) {
                // Copy event properties
                event[key] = e.data.event[key];
              }
            }
            this.dispatchEvent(event);
          }.bind(this),
          true
        );
      }
      get grammarsArray() {
        if (!this.grammars.length) {
          return undefined;
        }
        var grammars = [];
        for (var i = 0; i < this.grammars.length; i++) {
          grammars.push({
            src: this.grammars[i].src,
            weight: this.grammars[i].weight
          });
        }
        return grammars;
      }
    };
  }

  // MC
  feeles.ipcRenderer = new EventEmitter2();
  feeles.ipcRenderer.sendToHost = function () {
    requestPostMessage('ipcRenderer.sendToHost', arguments);
  };

  if (typeof window.define === 'function') {
    define('env', function () {
      return feeles.env;
    });
  }

  // setTimeout, setInterval
  feeles.setTimeout = function (func, delay) {
    var data = {
      timeoutId: setTimeout(null),
      delay: delay
    };
    func = typeof func === 'function' ? func : window[func];
    requestPostMessage('setTimeout', data, function () {
      func();
    });
    return data.timeoutId;
  };
  feeles.clearTimeout = function (timeoutId) {
    requestPostMessage('clearTimeout', {
      timeoutId: timeoutId
    });
  };
  feeles.setInterval = function (func, delay) {
    var data = {
      intervalId: setInterval(null),
      delay: delay
    };
    func = typeof func === 'function' ? func : window[func];
    var cb = function () {
      func();
    };
    requestPostMessage('setInterval', data, cb, true);
    return data.intervalId;
  };
  feeles.clearInterval = function (intervalId) {
    requestPostMessage('clearInterval', {
      intervalId: intervalId
    });
  };

  // Feeles の onMessage を dispatch する
  feeles.dispatchOnMessage = function(data) {
    requestPostMessage('dispatchOnMessage', data);
  };

  if (window.requirejs) {
    // Override require()
    window.requirejs.load = function (context, moduleName) {
      // module resolver by feeles
      feeles.resolve(moduleName).then(function (text) {
        if (text.indexOf('define(function') === 0) {
          // すでに AMD になっている
          eval(text);
        } else {
          // JavaScript を AMD にして define
          define(moduleName, new Function('require, exports, module', text));
        }
        context.completeLoad(moduleName);
      });
    };

    requirejs.onError = function (error) {
      console.info('requirejsonError');
      console.info(error);
      var message =
        typeof error === 'object' ?
        'Error: "' +
        error.message +
        '"' +
        (error.requireMap ? ' in ' + error.requireMap.name + '.js' : '') :
        error + '';
      requestPostMessage('error', message);
    };
  }

  function declarateVars(array) {
    var declarates = []; // [...{index, propName}]
    var add = function (index, propName) {
      // unique by propName (Post-preferred)
      for (var i = 0; i < declarates.length; i++) {
        if (declarates[i].propName === propName) {
          // Override
          declarates[i].index = index;
          return;
        }
      }
      declarates.push({
        index: index,
        propName: propName
      });
    };

    array
      .filter(function (ref) {
        return ref !== null && ref !== undefined;
      })
      .forEach(function (ref, index) {
        var props = [];
        if (ref.constructor !== Object) {
          // class X { f() {} } var x = new X() ====> ['constructor', 'f']
          var shallow = Object.getOwnPropertyNames(ref.constructor.prototype);
          Array.prototype.push.apply(props, shallow);
        }
        // var x = { f() {} } ====> ['f']
        var ownKeys = Object.getOwnPropertyNames(ref);
        Array.prototype.push.apply(props, ownKeys);
        // merge
        props.forEach(function (propName) {
          add(index, propName);
        });
      });

    return declarates;
  }

  function requestPostMessage(query, value, reply, continuous) {
    var message = {
      id: getUniqueId(),
      query: query,
      value: value
    };
    return connected.then(function (_ref) {
      return new Promise(function (resolve, reject) {
        if (reply) {
          _ref.port.addEventListener('message', function task(event) {
            if (event.data.id !== message.id) return;
            if (!continuous) {
              _ref.port.removeEventListener('message', task);
            }
            event.resolve = resolve;
            event.reject = reject;
            reply(event);
          });
        } else {
          resolve();
        }
        _ref.port.postMessage(message);
      });
    });
  }
})();