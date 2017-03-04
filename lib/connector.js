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
      if (!event.ports) return;

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
    return connected.then(function (_ref) {
      const port = _ref.port;
      return new Promise(function(resolve, reject) {
        const id = getUniqueId();
        port.addEventListener('message', function task(event) {
          if (event.data.id !== id) return;
          port.removeEventListener('message', task);
          if (event.data.error) {
            reject('Not found error in feeles.fetch: ' + name);
          } else {
            resolve(new Response(event.data.value));
          }
        });
        port.postMessage({
          query: 'fetch',
          id: id,
          value: name,
        });
      });
    });
  };

  feeles.saveAs = function (blob, name) {
    return connected.then(function (_ref) {
      const port = _ref.port;

      port.postMessage({
        query: 'saveAs',
        value: [blob, name],
      });
    });
  };

  feeles.reload = function () {
    return connected.then(function (_ref) {
      const port = _ref.port;

      port.postMessage({
        query: 'reload',
      });
    });
  };

  feeles.replace = function (url) {
    return connected.then(function (_ref) {
      const port = _ref.port;
      port.postMessage({
        query: 'replace',
        value: url,
      });
    });
  };

  feeles.openReadme = function (name) {
    return connected.then(function (_ref) {
      const port = _ref.port;
      port.postMessage({
        query: 'readme',
        value: name,
      });
    });
  };

  feeles.openMedia = function (value) {
    return connected.then(function (_ref) {
      const port = _ref.port;
      port.postMessage({
        query: 'media',
        value: value,
      });
    });
  };

  feeles.openCode = function (value) {
    return connected.then(function (_ref) {
      const port = _ref.port;
      port.postMessage({
        query: 'code',
        value: value,
      });
    });
  };

  if (typeof window.define === 'function') {
    define('env', function () {
      return feeles.env;
    });
  }

  if (window.requirejs) {
    requirejs.onError = function (error) {
      const message = typeof error === 'object' ? (
        'Error: "' +
          error.message +
          '"' +
          (error.requireMap ? ' in ' + error.requireMap.name + '.js' : '')
      ) : (
        error + ''
      );

      connected.then(function (_ref) {
        const port = _ref.port;

        port.postMessage({
          query: 'error',
          message: message,
        });
      });
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
}();
