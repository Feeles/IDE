!(function() {
  // An array of stocks for feeles.export
  feeles.exports = [];

  const getUniqueId = (function(id) {
    return function() {
      return 'FEELES_UNIQ_ID-' + ++id;
    };
  })(0);

  /**
   * @return Promise ({ port, model })
   */
  const connected = (feeles.connected = new Promise(function(resolve, reject) {
    window.addEventListener('message', function(event) {
      if (event.source === window || event.ports.length < 1) return;

      resolve({
        port: event.ports[0],
        model: event.data
      });
    });
  }));

  // Connect
  connected
    .then(function(_ref) {
      const port = _ref.port;
      const model = _ref.model;

      port.onmessage = function(e) {
        switch (e.data.query) {
          case 'shot':
            const decls = declarateVars(feeles.exports);
            const text =
              (decls.length
                ? 'var ' +
                    decls
                      .map(function(decl) {
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
                    ';'
                : '') + e.data.value.text;

            if (feeles.env.MODULE) {
              requirejs(
                ['require', 'exports', 'module'],
                new Function('require, exports, module', text)
              );
            } else {
              eval(text);
            }
            window.focus();
            break;
          case 'capture':
            // Screen Shot
            const canvas = document.querySelector('canvas');
            if (canvas) {
              port.postMessage({
                query: e.data.query,
                id: e.data.id,
                value: canvas.toDataURL(e.data.type)
              });
            } else {
              const bgcolor = getComputedStyle(document.body).backgroundColor;
              const params = {
                bgcolor: bgcolor,
                width: window.innerWidth,
                height: window.innerHeight
              };
              const promise = e.data.type === 'image/jpeg'
                ? domtoimage.toJpeg(document.body, params)
                : domtoimage.toPng(document.body, params);
              promise.then(function(dataURL) {
                port.postMessage({
                  query: e.data.query,
                  id: e.data.id,
                  value: dataURL
                });
              });
            }
            break;
        }
      };
    })
    .catch(function(err) {
      return console.error('feeles: Error in launch', err);
    });

  feeles.fetch = function(name) {
    return requestPostMessage('fetch', name, function(event) {
      if (event.data.error) {
        event.reject('Error in feeles.fetch in ' + name);
      } else {
        event.resolve(new Response(event.data.value));
      }
    });
  };

  feeles.resolve = function(name) {
    return requestPostMessage('resolve', name, function(event) {
      if (event.data.error) {
        event.reject('Error in feeles.resolve in ' + name);
      } else {
        event.resolve(event.data.value);
      }
    });
  };

  feeles.saveAs = function(blob, name) {
    return requestPostMessage('saveAs', [blob, name], function(event) {
      if (event.data.error) {
        event.reject('Error in feeles.saveAs in ' + name);
      } else {
        event.resolve(event.data.value);
      }
    });
  };
  feeles.reload = function() {
    return requestPostMessage('reload');
  };
  feeles.replace = function(url) {
    return requestPostMessage('replace', url);
  };

  feeles.openReadme = function(fileName) {
    return requestPostMessage('readme', fileName || '');
  };
  feeles.closeReadme = function() {
    return requestPostMessage('readme', null);
  };
  feeles.openMedia = function(params) {
    return requestPostMessage('media', params);
  };
  feeles.closeMedia = function() {
    return requestPostMessage('media', null);
  };
  feeles.openCode = function(fileName) {
    return requestPostMessage('code', fileName);
  };
  feeles.closeCode = function() {
    return requestPostMessage('code', null);
  };
  feeles.openEditor = function(fileName) {
    return requestPostMessage('editor', fileName);
  };
  feeles.closeEditor = function() {
    return requestPostMessage('editor', null);
  };
  feeles.setAlias = function(name, ref) {
    if (typeof feeles.exports[0] !== 'object') {
      // Backward compatibility
      feeles.exports[0] = {};
    }
    feeles.exports[0][name] = ref;
    const propNames = declarateVars(feeles.exports).map(function(decl) {
      return decl.propName;
    });
    return requestPostMessage('complete', propNames);
  };

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    feeles.SpeechRecognition = class PseudoSpeechRecognition
      extends SpeechRecognition {
      start() {
        const self = {
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
          function(e) {
            const event = new Event(e.data.type);
            for (let key in e.data.event) {
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
        const grammars = [];
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

  if (typeof window.define === 'function') {
    define('env', function() {
      return feeles.env;
    });
  }

  if (window.requirejs) {
    // Override require()
    window.requirejs.load = function(context, moduleName, url) {
      // module resolver by feeles
      feeles.resolve(moduleName).then(function(text) {
        define(moduleName, new Function('require, exports, module', text));
        context.completeLoad(moduleName);
      });
    };

    requirejs.onError = function(error) {
      console.error(error);
      const message = typeof error === 'object'
        ? 'Error: "' +
            error.message +
            '"' +
            (error.requireMap ? ' in ' + error.requireMap.name + '.js' : '')
        : error + '';
      requestPostMessage('error', message);
    };
  }

  function declarateVars(array) {
    const declarates = []; // [...{index, propName}]
    const add = function(index, propName) {
      // unique by propName　(Post-preferred)
      for (let i = 0; i < declarates.length; i++) {
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
      .filter(function(ref) {
        return ref !== null && ref !== undefined;
      })
      .forEach(function(ref, index) {
        const props = [];
        if (ref.constructor !== Object) {
          // class X { f() {} } const x = new X() ====> ['constructor', 'f']
          const shallow = Object.getOwnPropertyNames(ref.constructor.prototype);
          Array.prototype.push.apply(props, shallow);
        }
        // const x = { f() {} } ====> ['f']
        const ownKeys = Object.getOwnPropertyNames(ref);
        Array.prototype.push.apply(props, ownKeys);
        // merge
        props.forEach(function(propName) {
          add(index, propName);
        });
      });

    return declarates;
  }
  function requestPostMessage(query, value, reply, continuous = false) {
    const message = {
      id: getUniqueId(),
      query: query,
      value: value
    };
    return connected.then(function(_ref) {
      return new Promise(function(resolve, reject) {
        if (reply) {
          _ref.port.addEventListener('message', function task(event) {
            if (event.data.id !== message.id) return;
            if (continuous === false) {
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
