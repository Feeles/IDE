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

  // Define env
  (function (view) {
    Object.defineProperties(feeles.env, {
      // An abstract object/ Must implements "width" and "height" properties.
      VIEW: {
        configurable: true, enumerable: true,
        get: function get() {
          const current = hasView(view) ? view : { width: 300, height: 200 };
          return {
            width: parseInt(current.width, 10),
            height: parseInt(current.height, 10)
          };
        },
        set: function set(value) {
          view = value instanceof HTMLElement ? getComputedStyle(value) :
            hasView(value) ? value : null;
          emit('resize', feeles.env.VIEW);
        }
      }
    });

  })();

  const resizeDetection = (function (_width, _height) {
    return function () {
      const view = feeles.env.VIEW;
      if (view.width !== _width || view.height !== _height) {
        emit('resize', view);
        _width = view.width;
        _height = view.height;
      }
      requestAnimationFrame(resizeDetection);
    };
  })(feeles.env.VIEW.width, feeles.env.VIEW.height);
  requestAnimationFrame(resizeDetection);

  if (typeof window.define === 'function') {
    define('env', function () {
      return feeles.env;
    });
  }

  feeles.env.VIEW = document.documentElement;

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

  function hasView(view) {
    return view && typeof view === 'object' && 'width' in view && 'height' in view;
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

  /**
   * 1回しか dispatch されない EventListener を追加する
   * @param target:EventTarget
   * @param names:Array<String> ['load', 'error'] など、イベント名の配列
   * @param handler:Function
   */
  function onceEventListener(target, names, handler) {
    const once = function () {
      names.forEach(function (name) {
        target.removeEventListener(name, once);
      });
      handler.apply(this, arguments);
    };
    names.forEach(function (name) {
      target.addEventListener(name, once);
    });
  }

  function emit(query, value, port = null) {
    (port ? Promise.resolve({ port: port }) : connected)
      .then(function (ref) {
        ref.port.postMessage({ query: query, value: value });
      });
  }
}();
