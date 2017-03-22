;!function () {

  // An array of stocks for feeles.export
  feeles.exports = [];

  const getUniqueId = (function (id) {
    return function () { return 'FEELES_UNIQ_ID-' + ++id };
  })(0);

  /**
   * @return Promise ({ port, model })
   */
  const connected = feeles.connected = new Promise(function(resolve, reject) {
    window.addEventListener('message', function (event) {
      if (event.source === window || event.ports.length < 1) return;

      resolve({
        port: event.ports[0],
        model: event.data
      });
    });
  });

  // Connect
  connected.then(function (_ref) {
    const port = _ref.port;
    const model = _ref.model;

    port.onmessage = function (e) {
      switch (e.data.query) {
        case 'shot':
          const decls = declarateVars(feeles.exports);
          const text = (decls.length ? 'var ' + decls.map(function (decl) {
            return decl.propName + '=feeles.exports[' + decl.index + ']["' + decl.propName + '"]';
          }).join(',') + ';' : '') + e.data.value.text;

          if (feeles.env.MODULE) {
            requirejs(['require', 'exports', 'module'], new Function('require, exports, module', text));
          } else {
            eval(text);
          }
          window.focus();
          break;
      }
    };

    setTimeout(function () {
      const propNames = declarateVars(feeles.exports).map(function (decl) {
        return decl.propName;
      });

      emit('complete', propNames, _ref.port);
    }, 100);

  }).catch(function (err) {
    return console.error('feeles: Error in launch', err);
  });


  feeles.fetch = function (name) {
    return requestPostMessage('fetch', name, function (event, resolve, reject) {
      if (event.data.error) {
        reject('Error in feeles.fetch', event.data.error);
      } else {
        resolve(new Response(event.data.value));
      }
    });
  };

  feeles.resolve = function (name) {
    return requestPostMessage('resolve', name, function (event, resolve, reject) {
      if (event.data.error) {
        reject('Error in feeles.resolve', event.data.error);
      } else {
        resolve(event.data.value);
      }
    });
  };

  feeles.saveAs = function (blob, name) {
    return requestPostMessage('saveAs', [blob, name]);
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

  if (typeof window.define === 'function') {
    define('env', function () {
      return feeles.env;
    });
  }

  if (window.requirejs) {
    // Override require()
    window.requirejs.load = function (context, moduleName, url) {
      // module resolver by feeles
      feeles.resolve(moduleName)
        .then(function (text) {
          define(moduleName, new Function('require, exports, module', text));
          context.completeLoad(moduleName);
        });
    };

    requirejs.onError = function (error) {
      const message = typeof error === 'object' ? (
        'Error: "' +
          error.message +
          '"' +
          (error.requireMap ? ' in ' + error.requireMap.name + '.js' : '')
      ) : (
        error + ''
      );
      requestPostMessage('error', message);
    };
  }

  function declarateVars(array) {

    const declarates = []; // [...{index, propName}]
    const add = function (index, propName) {
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
        propName: propName,
      });
    };

    array.filter(function (ref) {
      return ref !== null && ref !== undefined;
    }).forEach(function (ref, index) {
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
      props.forEach(function (propName) {
        add(index, propName);
      });
    });

    return declarates;

  }
  function emit(query, value, port = null) {
    (port ? Promise.resolve({ port: port }) : connected)
      .then(function (ref) {
        ref.port.postMessage({ query: query, value: value });
      });
  }
  function requestPostMessage(query, value, reply) {
    const message = {
      id: getUniqueId(),
      query: query,
      value: value
    };
    return connected.then(function (_ref) {
      return new Promise(function (resolve, reject) {

        if (reply) {
          _ref.port.addEventListener('message', function task(event) {
            if (event.data.id !== message.id) return;
            _ref.port.removeEventListener('message', task);
            reply(event, resolve, reject);
          });
        } else {
          resolve();
        }
        _ref.port.postMessage(message);

      });
    });
  }
}();
