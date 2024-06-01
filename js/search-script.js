!function(t){
  const w = {
    merge: function(t, e) {
      const n = {};
      for (const r in t) n[r] = t[r], "undefined" != typeof e[r] && (n[r] = e[r]);
      return n;
    },
    isJSON: function(t) {
      try {
        return t instanceof Object && JSON.parse(JSON.stringify(t)) ? !0 : !1;
      } catch (e) {
        return !1;
      }
    }
  };

  const p = {
    load: function(t, e) {
      const n = window.XMLHttpRequest ? new window.XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
      n.open("GET", t, !0), n.onreadystatechange = h(n, e), n.send();
    }
  };

  function h(e, n) {
    return function() {
      if (4 === e.readyState && 200 === e.status)
        try {
          n(null, JSON.parse(e.responseText));
        } catch (t) {
          n(t, null);
        }
    };
  }

  const f = {
    compile: function(template) {
      const keys = Object.keys(template);
      let compiledTemplate = this.template;
      keys.forEach(key => {
        const re = new RegExp(`{${key}}`, 'g');
        compiledTemplate = compiledTemplate.replace(re, this.middleware(key, template[key], this.template));
      });
      return compiledTemplate;
    },
    setOptions: function(options) {
      this.template = options.template;
      this.middleware = options.middleware;
    }
  };

  const d = {
    put: function(data) {
      this.data = data;
    },
    search: function(query) {
      const result = [];
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].title.includes(query)) {
          result.push(this.data[i]);
        }
      }
      return result;
    },
    setOptions: function(options) {
      this.fuzzy = options.fuzzy;
      this.limit = options.limit;
      this.sort = options.sort;
      this.exclude = options.exclude;
    }
  };

  const m = function y(t) {
    if (!(e = t) || !("undefined" != typeof e.required && e.required instanceof Array))
      throw new Error("-- OptionsValidator: required options missing");
    var e;
    if (!(this instanceof y)) return new y(t);
    const r = t.required;
    this.getRequiredOptions = function() { return r; };
    this.validate = function(e) {
      const n = [];
      r.forEach(function(t) {
        "undefined" == typeof e[t] && n.push(t);
      });
      return n;
    };
  };

  let i = {
    searchInput: null,
    resultsContainer: null,
    json: [],
    success: Function.prototype,
    searchResultTemplate: '<li><a href="{url}" title="{desc}">{title}</a></li>',
    templateMiddleware: function(prop, value, template) {
      if (prop === 'url') {
        // Remove any leading slashes from value if it exists
        value = value.replace(/^\/+/, '');
        return `https://blackstargal.github.io/${value}`;
      }
      return value;
    },
    sortMiddleware: function() { return 0; },
    noResultsText: "No results found",
    limit: 10,
    fuzzy: !1,
    debounceTime: null,
    exclude: []
  }, n;

  const e = function(t, e) {
    e ? (clearTimeout(n), n = setTimeout(t, e)) : t.call();
  };

  var r = ["searchInput", "resultsContainer", "json"];
  const o = m({ required: r });

  function u(t) {
    d.put(t);
    i.searchInput.addEventListener("input", function(t) {
      if (-1 === [13, 16, 20, 37, 38, 39, 40, 91].indexOf(t.which)) {
        c();
        e(function() {
          l(t.target.value);
        }, i.debounceTime);
      }
    });
  }

  function c() {
    i.resultsContainer.innerHTML = "";
  }

  function s(t) {
    i.resultsContainer.innerHTML += t;
  }

  function l(t) {
    var e;
    (e = t) && e.length > 0 && (c(), function(e, n) {
      var r = e.length;
      if (r === 0) return s(i.noResultsText);
      for (let t = 0; t < r; t++) {
        e[t].query = n;
        s(f.compile(e[t]));
      }
    }(d.search(t), t));
  }

  function a(t) {
    throw new Error("SimpleJekyllSearch --- " + t);
  }

  t.SimpleJekyllSearch = function(t) {
    var n;
    if (o.validate(t).length > 0) {
      a("You must specify the following required options: " + r);
    }

    i = w.merge(i, t);
    f.setOptions({
      template: i.searchResultTemplate,
      middleware: i.templateMiddleware
    });
    d.setOptions({
      fuzzy: i.fuzzy,
      limit: i.limit,
      sort: i.sortMiddleware,
      exclude: i.exclude
    });

    if (w.isJSON(i.json)) {
      u(i.json);
    } else {
      n = i.json;
      p.load(n, function(t, e) {
        if (t) a("failed to get JSON (" + n + ")");
        u(e);
      });
    }

    t = { search: l };
    if (typeof i.success === "function") {
      i.success.call(t);
    }
    return t;
  };
}(window);

