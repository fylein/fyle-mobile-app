console.log("=================1===============");
try {
    console.log("=================2===============");
  (function() {
      var exports = exports || {};
      !function(t) {
          exports.qs = t()
      }(function() {
          return function t(e, n, i) {
              function r(s, a) {
                  if (!n[s]) {
                      if (!e[s]) {
                          var u = "function" == typeof require && require;
                          if (!a && u)
                              return u(s, !0);
                          if (o)
                              return o(s, !0);
                          var l = new Error("Cannot find module '" + s + "'");
                          throw l.code = "MODULE_NOT_FOUND", l
                      }
                      var c = n[s] = {
                          exports: {}
                      };
                      e[s][0].call(c.exports, function(t) {
                          var n = e[s][1][t];
                          return r(n ? n : t)
                      }, c, c.exports, t, e, n, i)
                  }
                  return n[s].exports
              }
              for (var o = "function" == typeof require && require, s = 0; s < i.length; s++)
                  r(i[s]);
              return r
          }({
              1: [function(t, e) {
                  "use strict";
                  var n = t("./stringify"),
                      i = t("./parse");
                  e.exports = {
                      stringify: n,
                      parse: i
                  }
              }, {
                  "./parse": 2,
                  "./stringify": 3
              }],
              2: [function(t, e) {
                  "use strict";
                  var n = t("./utils"),
                      i = Object.prototype.hasOwnProperty,
                      r = {
                          delimiter: "&",
                          depth: 5,
                          arrayLimit: 20,
                          parameterLimit: 1e3,
                          strictNullHandling: !1,
                          plainObjects: !1,
                          allowPrototypes: !1,
                          allowDots: !1,
                          decoder: n.decode
                      },
                      o = function(t, e) {
                          for (var n = {}, r = t.split(e.delimiter, e.parameterLimit === 1 / 0 ? void 0 : e.parameterLimit), o = 0; o < r.length; ++o) {
                              var s,
                                  a,
                                  u = r[o],
                                  l = u.indexOf("]=") === -1 ? u.indexOf("=") : u.indexOf("]=") + 1;
                              l === -1 ? (s = e.decoder(u), a = e.strictNullHandling ? null : "") : (s = e.decoder(u.slice(0, l)), a = e.decoder(u.slice(l + 1))),
                              i.call(n, s) ? n[s] = [].concat(n[s]).concat(a) : n[s] = a
                          }
                          return n
                      },
                      s = function t(e, n, i) {
                          if (!e.length)
                              return n;
                          var r,
                              o = e.shift();
                          if ("[]" === o)
                              r = [],
                              r = r.concat(t(e, n, i));
                          else {
                              r = i.plainObjects ? Object.create(null) : {};
                              var s = "[" === o[0] && "]" === o[o.length - 1] ? o.slice(1, o.length - 1) : o,
                                  a = parseInt(s, 10);
                              !isNaN(a) && o !== s && String(a) === s && a >= 0 && i.parseArrays && a <= i.arrayLimit ? (r = [], r[a] = t(e, n, i)) : r[s] = t(e, n, i)
                          }
                          return r
                      },
                      a = function(t, e, n) {
                          if (t) {
                              var r = n.allowDots ? t.replace(/\.([^\.\[]+)/g, "[$1]") : t,
                                  o = /^([^\[\]]*)/,
                                  a = /(\[[^\[\]]*\])/g,
                                  u = o.exec(r),
                                  l = [];
                              if (u[1]) {
                                  if (!n.plainObjects && i.call(Object.prototype, u[1]) && !n.allowPrototypes)
                                      return;
                                  l.push(u[1])
                              }
                              for (var c = 0; null !== (u = a.exec(r)) && c < n.depth;)
                                  c += 1,
                                  (n.plainObjects || !i.call(Object.prototype, u[1].replace(/\[|\]/g, "")) || n.allowPrototypes) && l.push(u[1]);
                              return u && l.push("[" + r.slice(u.index) + "]"), s(l, e, n)
                          }
                      };
                  e.exports = function(t, e) {
                      var i = e || {};
                      if (null !== i.decoder && void 0 !== i.decoder && "function" != typeof i.decoder)
                          throw new TypeError("Decoder has to be a function.");
                      if (i.delimiter = "string" == typeof i.delimiter || n.isRegExp(i.delimiter) ? i.delimiter : r.delimiter, i.depth = "number" == typeof i.depth ? i.depth : r.depth, i.arrayLimit = "number" == typeof i.arrayLimit ? i.arrayLimit : r.arrayLimit, i.parseArrays = i.parseArrays !== !1, i.decoder = "function" == typeof i.decoder ? i.decoder : r.decoder, i.allowDots = "boolean" == typeof i.allowDots ? i.allowDots : r.allowDots, i.plainObjects = "boolean" == typeof i.plainObjects ? i.plainObjects : r.plainObjects, i.allowPrototypes = "boolean" == typeof i.allowPrototypes ? i.allowPrototypes : r.allowPrototypes, i.parameterLimit = "number" == typeof i.parameterLimit ? i.parameterLimit : r.parameterLimit, i.strictNullHandling = "boolean" == typeof i.strictNullHandling ? i.strictNullHandling : r.strictNullHandling, "" === t || null === t || "undefined" == typeof t)
                          return i.plainObjects ? Object.create(null) : {};
                      for (var s = "string" == typeof t ? o(t, i) : t, u = i.plainObjects ? Object.create(null) : {}, l = Object.keys(s), c = 0; c < l.length; ++c) {
                          var d = l[c],
                              h = a(d, s[d], i);
                          u = n.merge(u, h, i)
                      }
                      return n.compact(u)
                  }
              }, {
                  "./utils": 4
              }],
              3: [function(t, e) {
                  "use strict";
                  var n = t("./utils"),
                      i = {
                          brackets: function(t) {
                              return t + "[]"
                          },
                          indices: function(t, e) {
                              return t + "[" + e + "]"
                          },
                          repeat: function(t) {
                              return t
                          }
                      },
                      r = {
                          delimiter: "&",
                          strictNullHandling: !1,
                          skipNulls: !1,
                          encode: !0,
                          encoder: n.encode
                      },
                      o = function t(e, i, r, o, s, a, u, l, c) {
                          var d = e;
                          if ("function" == typeof u)
                              d = u(i, d);
                          else if (d instanceof Date)
                              d = d.toISOString();
                          else if (null === d) {
                              if (o)
                                  return a ? a(i) : i;
                              d = ""
                          }
                          if ("string" == typeof d || "number" == typeof d || "boolean" == typeof d || n.isBuffer(d))
                              return a ? [a(i) + "=" + a(d)] : [i + "=" + String(d)];
                          var h = [];
                          if ("undefined" == typeof d)
                              return h;
                          var p;
                          if (Array.isArray(u))
                              p = u;
                          else {
                              var f = Object.keys(d);
                              p = l ? f.sort(l) : f
                          }
                          for (var m = 0; m < p.length; ++m) {
                              var g = p[m];
                              s && null === d[g] || (h = Array.isArray(d) ? h.concat(t(d[g], r(i, g), r, o, s, a, u, l, c)) : h.concat(t(d[g], i + (c ? "." + g : "[" + g + "]"), r, o, s, a, u, l, c)))
                          }
                          return h
                      };
                  e.exports = function(t, e) {
                      var n,
                          s,
                          a = t,
                          u = e || {},
                          l = "undefined" == typeof u.delimiter ? r.delimiter : u.delimiter,
                          c = "boolean" == typeof u.strictNullHandling ? u.strictNullHandling : r.strictNullHandling,
                          d = "boolean" == typeof u.skipNulls ? u.skipNulls : r.skipNulls,
                          h = "boolean" == typeof u.encode ? u.encode : r.encode,
                          p = h ? "function" == typeof u.encoder ? u.encoder : r.encoder : null,
                          f = "function" == typeof u.sort ? u.sort : null,
                          m = "undefined" != typeof u.allowDots && u.allowDots;
                      if (null !== u.encoder && void 0 !== u.encoder && "function" != typeof u.encoder)
                          throw new TypeError("Encoder has to be a function.");
                      "function" == typeof u.filter ? (s = u.filter, a = s("", a)) : Array.isArray(u.filter) && (n = s = u.filter);
                      var g = [];
                      if ("object" != typeof a || null === a)
                          return "";
                      var y;
                      y = u.arrayFormat in i ? u.arrayFormat : "indices" in u ? u.indices ? "indices" : "repeat" : "indices";
                      var v = i[y];
                      n || (n = Object.keys(a)),
                      f && n.sort(f);
                      for (var _ = 0; _ < n.length; ++_) {
                          var b = n[_];
                          d && null === a[b] || (g = g.concat(o(a[b], b, v, c, d, p, s, f, m)))
                      }
                      return g.join(l)
                  }
              }, {
                  "./utils": 4
              }],
              4: [function(t, e, n) {
                  "use strict";
                  var i = function() {
                      for (var t = new Array(256), e = 0; e < 256; ++e)
                          t[e] = "%" + ((e < 16 ? "0" : "") + e.toString(16)).toUpperCase();
                      return t
                  }();
                  n.arrayToObject = function(t, e) {
                      for (var n = e.plainObjects ? Object.create(null) : {}, i = 0; i < t.length; ++i)
                          "undefined" != typeof t[i] && (n[i] = t[i]);
                      return n
                  },
                  n.merge = function(t, e, i) {
                      if (!e)
                          return t;
                      if ("object" != typeof e) {
                          if (Array.isArray(t))
                              t.push(e);
                          else {
                              if ("object" != typeof t)
                                  return [t, e];
                              t[e] = !0
                          }
                          return t
                      }
                      if ("object" != typeof t)
                          return [t].concat(e);
                      var r = t;
                      return Array.isArray(t) && !Array.isArray(e) && (r = n.arrayToObject(t, i)), Object.keys(e).reduce(function(t, r) {
                          var o = e[r];
                          return Object.prototype.hasOwnProperty.call(t, r) ? t[r] = n.merge(t[r], o, i) : t[r] = o, t
                      }, r)
                  },
                  n.decode = function(t) {
                      try {
                          return decodeURIComponent(t.replace(/\+/g, " "))
                      } catch (e) {
                          return t
                      }
                  },
                  n.encode = function(t) {
                      if (0 === t.length)
                          return t;
                      for (var e = "string" == typeof t ? t : String(t), n = "", r = 0; r < e.length; ++r) {
                          var o = e.charCodeAt(r);
                          45 === o || 46 === o || 95 === o || 126 === o || o >= 48 && o <= 57 || o >= 65 && o <= 90 || o >= 97 && o <= 122 ? n += e.charAt(r) : o < 128 ? n += i[o] : o < 2048 ? n += i[192 | o >> 6] + i[128 | 63 & o] : o < 55296 || o >= 57344 ? n += i[224 | o >> 12] + i[128 | o >> 6 & 63] + i[128 | 63 & o] : (r += 1, o = 65536 + ((1023 & o) << 10 | 1023 & e.charCodeAt(r)), n += i[240 | o >> 18] + i[128 | o >> 12 & 63] + i[128 | o >> 6 & 63] + i[128 | 63 & o])
                      }
                      return n
                  },
                  n.compact = function(t, e) {
                      if ("object" != typeof t || null === t)
                          return t;
                      var i = e || [],
                          r = i.indexOf(t);
                      if (r !== -1)
                          return i[r];
                      if (i.push(t), Array.isArray(t)) {
                          for (var o = [], s = 0; s < t.length; ++s)
                              t[s] && "object" == typeof t[s] ? o.push(n.compact(t[s], i)) : "undefined" != typeof t[s] && o.push(t[s]);
                          return o
                      }
                      for (var a = Object.keys(t), u = 0; u < a.length; ++u) {
                          var l = a[u];
                          t[l] = n.compact(t[l], i)
                      }
                      return t
                  },
                  n.isRegExp = function(t) {
                      return "[object RegExp]" === Object.prototype.toString.call(t)
                  },
                  n.isBuffer = function(t) {
                      return null !== t && "undefined" != typeof t && !!(t.constructor && t.constructor.isBuffer && t.constructor.isBuffer(t))
                  }
              }, {}]
          }, {}, [1])(1)
      }),
      function(t) {
          var e = function() {
              "use strict";
              function t(e, n, i, r) {
                  function s(e, i) {
                      if (null === e)
                          return null;
                      if (0 === i)
                          return e;
                      var a,
                          d;
                      if ("object" != typeof e)
                          return e;
                      if (t.__isArray(e))
                          a = [];
                      else if (t.__isRegExp(e))
                          a = new RegExp(e.source, o(e)),
                          e.lastIndex && (a.lastIndex = e.lastIndex);
                      else if (t.__isDate(e))
                          a = new Date(e.getTime());
                      else {
                          if (c && Buffer.isBuffer(e))
                              return a = new Buffer(e.length), e.copy(a), a;
                          "undefined" == typeof r ? (d = Object.getPrototypeOf(e), a = Object.create(d)) : (a = Object.create(r), d = r)
                      }
                      if (n) {
                          var h = u.indexOf(e);
                          if (h != -1)
                              return l[h];
                          u.push(e),
                          l.push(a)
                      }
                      for (var p in e) {
                          var f;
                          d && (f = Object.getOwnPropertyDescriptor(d, p)),
                          f && null == f.set || (a[p] = s(e[p], i - 1))
                      }
                      return a
                  }
                  var a;
                  "object" == typeof n && (i = n.depth, r = n.prototype, a = n.filter, n = n.circular);
                  var u = [],
                      l = [],
                      c = "undefined" != typeof Buffer;
                  return "undefined" == typeof n && (n = !0), "undefined" == typeof i && (i = 1 / 0), s(e, i)
              }
              function e(t) {
                  return Object.prototype.toString.call(t)
              }
              function n(t) {
                  return "object" == typeof t && "[object Date]" === e(t)
              }
              function i(t) {
                  return "object" == typeof t && "[object Array]" === e(t)
              }
              function r(t) {
                  return "object" == typeof t && "[object RegExp]" === e(t)
              }
              function o(t) {
                  var e = "";
                  return t.global && (e += "g"), t.ignoreCase && (e += "i"), t.multiline && (e += "m"), e
              }
              return t.clonePrototype = function(t) {
                  if (null === t)
                      return null;
                  var e = function() {};
                  return e.prototype = t, new e
              }, t.__objToStr = e, t.__isDate = n, t.__isArray = i, t.__isRegExp = r, t.__getRegExpFlags = o, t
          }();
          t.clone = e
      }("object" == typeof exports ? exports : this),
      function(t) {
          exports.topdomain = t()
      }(function() {
          return function t(e, n, i) {
              function r(s, a) {
                  if (!n[s]) {
                      if (!e[s]) {
                          var u = "function" == typeof require && require;
                          if (!a && u)
                              return u(s, !0);
                          if (o)
                              return o(s, !0);
                          var l = new Error("Cannot find module '" + s + "'");
                          throw l.code = "MODULE_NOT_FOUND", l
                      }
                      var c = n[s] = {
                          exports: {}
                      };
                      e[s][0].call(c.exports, function(t) {
                          var n = e[s][1][t];
                          return r(n ? n : t)
                      }, c, c.exports, t, e, n, i)
                  }
                  return n[s].exports
              }
              for (var o = "function" == typeof require && require, s = 0; s < i.length; s++)
                  r(i[s]);
              return r
          }({
              1: [function(t, e, n) {
                  "use strict";
                  function i(t) {
                      for (var e = n.cookie, i = n.levels(t), r = 0; r < i.length; ++r) {
                          var o = "__tld__",
                              s = i[r],
                              a = {
                                  domain: "." + s
                              };
                          if (e(o, 1, a), e(o))
                              return e(o, null, a), s
                      }
                      return ""
                  }
                  var r = t("component-url").parse,
                      o = t("component-cookie");
                  i.levels = function(t) {
                      var e = r(t).hostname,
                          n = e.split("."),
                          i = n[n.length - 1],
                          o = [];
                      if (4 === n.length && i === parseInt(i, 10))
                          return o;
                      if (n.length <= 1)
                          return o;
                      for (var s = n.length - 2; s >= 0; --s)
                          o.push(n.slice(s).join("."));
                      return o
                  },
                  i.cookie = o,
                  n = e.exports = i
              }, {
                  "component-cookie": 2,
                  "component-url": 3
              }],
              2: [function(t, e) {
                  function n(t, e, n) {
                      n = n || {};
                      var i = s(t) + "=" + s(e);
                      null == e && (n.maxage = -1),
                      n.maxage && (n.expires = new Date(+new Date + n.maxage)),
                      n.path && (i += "; path=" + n.path),
                      n.domain && (i += "; domain=" + n.domain),
                      n.expires && (i += "; expires=" + n.expires.toUTCString()),
                      n.secure && (i += "; secure"),
                      document.cookie = i
                  }
                  function i() {
                      var t;
                      try {
                          t = document.cookie
                      } catch (t) {
                          return "undefined" != typeof console && "function" == typeof console.error && console.error(t.stack || t), {}
                      }
                      return o(t)
                  }
                  function r(t) {
                      return i()[t]
                  }
                  function o(t) {
                      var e,
                          n = {},
                          i = t.split(/ *; */);
                      if ("" == i[0])
                          return n;
                      for (var r = 0; r < i.length; ++r)
                          e = i[r].split("="),
                          n[a(e[0])] = a(e[1]);
                      return n
                  }
                  function s(t) {
                      try {
                          return encodeURIComponent(t)
                      } catch (t) {}
                  }
                  function a(t) {
                      try {
                          return decodeURIComponent(t)
                      } catch (t) {}
                  }
                  e.exports = function(t, e, o) {
                      switch (arguments.length) {
                      case 3:
                      case 2:
                          return n(t, e, o);
                      case 1:
                          return r(t);
                      default:
                          return i()
                      }
                  }
              }, {}],
              3: [function(t, e, n) {
                  function i(t) {
                      switch (t) {
                      case "http:":
                          return 80;
                      case "https:":
                          return 443;
                      default:
                          return location.port
                      }
                  }
                  n.parse = function(t) {
                      var e = document.createElement("a");
                      return e.href = t, {
                          href: e.href,
                          host: e.host || location.host,
                          port: "0" === e.port || "" === e.port ? i(e.protocol) : e.port,
                          hash: e.hash,
                          hostname: e.hostname || location.hostname,
                          pathname: "/" != e.pathname.charAt(0) ? "/" + e.pathname : e.pathname,
                          protocol: e.protocol && ":" != e.protocol ? e.protocol : location.protocol,
                          search: e.search,
                          query: e.search.slice(1)
                      }
                  },
                  n.isAbsolute = function(t) {
                      return 0 == t.indexOf("//") || !!~t.indexOf("://")
                  },
                  n.isRelative = function(t) {
                      return !n.isAbsolute(t)
                  },
                  n.isCrossDomain = function(t) {
                      t = n.parse(t);
                      var e = n.parse(e.href);
                      return t.hostname !== e.hostname || t.port !== e.port || t.protocol !== e.protocol
                  }
              }, {}]
          }, {}, [1])(1)
      }),
      function() {
          exports.utils = {
              timeout: function(t, e) {
                  return setTimeout(e, t)
              },
              getCurrentTimestamp: function() {
                  return (new Date).getTime()
              },
              sampleArray: function(t) {
                  return t[Math.floor(Math.random() * t.length)]
              },
              shuffleArray: function(t) {
                  var e,
                      n,
                      i,
                      r,
                      o,
                      s;
                  if (t.length > 1) {
                      for (s = [], e = i = r = t.length - 1; r <= 1 ? i <= 1 : i >= 1; e = r <= 1 ? ++i : --i)
                          n = Math.floor(Math.random() * (e + 1)),
                          s.push((o = [t[n], t[e]], t[e] = o[0], t[n] = o[1], o));
                      return s
                  }
              },
              buildLogger: function(t, e) {
                  var n,
                      i,
                      r,
                      o;
                  i = {
                      silent: 0,
                      error: 1,
                      warn: 2,
                      info: 3,
                      debug: 4
                  },
                  r = {
                      level: e || "warn"
                  },
                  n = function(e, n) {
                      return r[e] = function() {
                          var o,
                              s;
                          if (n <= i[r.level]) {
                              o = Array.prototype.slice.apply(arguments),
                              i[r.level] > 3 && "performance" in window && "now" in window.performance && o.unshift("+" + Math.round(performance.now()) + "ms"),
                              o.unshift(t);
                              try {
                                  return "undefined" != typeof console && null !== console && null != (s = console[e]) ? s.apply(console, o) : void 0
                              } catch (t) {
                                  return console.log(e + " " + o.join(", "))
                              }
                          }
                      }
                  };
                  for (e in i)
                      o = i[e],
                      n(e, o);
                  return r
              },
              ajaxSimpleCors: function(t) {
                  var e,
                      n,
                      i,
                      r;
                  return e = t.body || {}, i = (t.method || "GET").toUpperCase(), n = "GET" === i || "POST" === i ? i : (e._method = i, "POST"), r = new XMLHttpRequest, r.open(n, t.url, t.async), r.withCredentials = !!t.withCredentials, r.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), r.setRequestHeader("Accept", "application/json"), t.callback && (r.onload = function() {
                      var e;
                      return e = JSON.parse(r.responseText), e.redirect_url ? (t.onRedirect && t.onRedirect(e), exports.utils.ajaxSimpleCors({
                          url: e.redirect_url,
                          callback: t.callback,
                          withCredentials: t.withCredentials
                      })) : t.callback(e)
                  }), "GET" !== n ? r.send(exports.qs.stringify(e, t.qsOpts)) : r.send()
              },
              isBlank: function(t) {
                  return !t || /^\s*$/.test(t)
              }
          }
      }.call(this),
      function(t) {
          exports.Cookies = t()
      }(function() {
          function t() {
              for (var t = 0, e = {}; t < arguments.length; t++) {
                  var n = arguments[t];
                  for (var i in n)
                      e[i] = n[i]
              }
              return e
          }
          function e(t) {
              return t.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent)
          }
          function n(i) {
              function r() {}
              function o(e, n, o) {
                  if ("undefined" != typeof document) {
                      o = t({
                          path: "/"
                      }, r.defaults, o),
                      "number" == typeof o.expires && (o.expires = new Date(1 * new Date + 864e5 * o.expires)),
                      o.expires = o.expires ? o.expires.toUTCString() : "";
                      try {
                          var s = JSON.stringify(n);
                          /^[\{\[]/.test(s) && (n = s)
                      } catch (t) {}
                      n = i.write ? i.write(n, e) : encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent),
                      e = encodeURIComponent(String(e)).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent).replace(/[\(\)]/g, escape);
                      var a = "";
                      for (var u in o)
                          o[u] && (a += "; " + u, o[u] !== !0 && (a += "=" + o[u].split(";")[0]));
                      return document.cookie = e + "=" + n + a
                  }
              }
              function s(t, n) {
                  if ("undefined" != typeof document) {
                      for (var r = {}, o = document.cookie ? document.cookie.split("; ") : [], s = 0; s < o.length; s++) {
                          var a = o[s].split("="),
                              u = a.slice(1).join("=");
                          n || '"' !== u.charAt(0) || (u = u.slice(1, -1));
                          try {
                              var l = e(a[0]);
                              if (u = (i.read || i)(u, l) || e(u), n)
                                  try {
                                      u = JSON.parse(u)
                                  } catch (t) {}
                              if (r[l] = u, t === l)
                                  break
                          } catch (t) {}
                      }
                      return t ? r[t] : r
                  }
              }
              return r.set = o, r.get = function(t) {
                  return s(t, !1)
              }, r.getJSON = function(t) {
                  return s(t, !0)
              }, r.remove = function(e, n) {
                  o(e, "", t(n, {
                      expires: -1
                  }))
              }, r.defaults = {}, r.withConverter = n, r
          }
          return n(function() {})
      }),
      !function(t, e) {
          exports[t] = e()
      }("domready", function(t) {
          function e(t) {
              for (p = 1; t = i.shift();)
                  t()
          }
          var n,
              i = [],
              r = !1,
              o = document,
              s = o.documentElement,
              a = s.doScroll,
              u = "DOMContentLoaded",
              l = "addEventListener",
              c = "onreadystatechange",
              d = "readyState",
              h = a ? /^loaded|^c/ : /^loaded|c/,
              p = h.test(o[d]);
          return o[l] && o[l](u, n = function() {
              o.removeEventListener(u, n, r),
              e()
          }, r), a && o.attachEvent(c, n = function() {
              /^c/.test(o[d]) && (o.detachEvent(c, n), e())
          }), t = a ? function(e) {
              self != top ? p ? e() : i.push(e) : function() {
                  try {
                      s.doScroll("left")
                  } catch (n) {
                      return setTimeout(function() {
                          t(e)
                      }, 50)
                  }
                  e()
              }()
          } : function(t) {
              p ? t() : i.push(t)
          }
      }),
      function(t) {
          var e = 0,
              n = window.requestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame || function(t) {
                  var n = (new Date).getTime(),
                      i = Math.max(0, 16 - (n - e)),
                      r = setTimeout(function() {
                          t(n + i)
                      }, i);
                  return e = n + i, r
              };
          t.requestAnimationFrame = function(t, e) {
              return n.call(window, t, e)
          }
      }("object" == typeof exports ? exports : this),
      function(t) {
          var e = "addEventListener" in window ? "addEventListener" : "attachEvent",
              n = function(t) {
                  return "addEventListener" === t ? function(t, e, n) {
                      return t.addEventListener(e, n, !1)
                  } : function(t, e, n) {
                      return t.attachEvent("on" + e, n)
                  }
              }(e);
          t.addEventListener = n
      }("object" == typeof exports ? exports : this),
      function() {
          var t = function(t, e) {
              return function() {
                  return t.apply(e, arguments)
              }
          };
          exports.DomHelpers = function() {
              function e(e) {
                  this.getElement = t(this.getElement, this),
                  this.reverseChildren = t(this.reverseChildren, this),
                  this.isVisible = t(this.isVisible, this),
                  this.detectOrientation = t(this.detectOrientation, this),
                  this.calcScreenHeight = t(this.calcScreenHeight, this),
                  this.calcWindowWidth = t(this.calcWindowWidth, this),
                  this.calcWindowHeight = t(this.calcWindowHeight, this),
                  this.bindEvent = t(this.bindEvent, this),
                  this._getInitialStyleFloat = t(this._getInitialStyleFloat, this),
                  this.translateY = t(this.translateY, this),
                  this.transition = t(this.transition, this),
                  this.setOpacity = t(this.setOpacity, this),
                  this.clearInlineStyle = t(this.clearInlineStyle, this),
                  this.setStyle = t(this.setStyle, this),
                  this.getComputedStyle = t(this.getComputedStyle, this),
                  this.config = e
              }
              return e.prototype.getComputedStyle = function(t, e) {
                  return this.config.BROWSER_SUPPORT.features.getComputedStyle ? getComputedStyle(t, null).getPropertyValue(e) : t.currentStyle[e]
              }, e.prototype.setStyle = function(t, e, n) {
                  return t.style.setProperty(e, n, "important")
              }, e.prototype.clearInlineStyle = function(t, e) {
                  return t.style.removeProperty(e)
              }, e.prototype.setOpacity = function(t, e) {
                  return this.setStyle(t, "opacity", e)
              }, e.prototype.transition = function(t, e) {
                  if (this.config.BROWSER_SUPPORT.features.transition)
                      return this.config.BROWSER_SUPPORT.features.transform ? this.setStyle(t, "transition", e) : this.setStyle(t, "transition", e.replace(/transform/g, "bottom"))
              }, e.prototype.translateY = function(t, e) {
                  var n;
                  return this.config.BROWSER_SUPPORT.features.transform ? this.setStyle(t, "transform", "translate3d(0, " + e + "px, 0)") : (n = this._getInitialStyleFloat(t, "bottom"), "static" === this.getComputedStyle(t, "position") && this.setStyle(t, "position", "relative"), this.setStyle(t, "bottom", -e + n + "px"))
              }, e.prototype._getInitialStyleFloat = function(t, e) {
                  var n;
                  return (n = t.getAttribute("data-initial-" + e)) ? parseFloat(n, 10) : (n = parseFloat(this.getComputedStyle(t, e), 10) || 0, t.setAttribute("data-initial-" + e, n), n)
              }, e.prototype.bindEvent = function(t, e, n) {
                  return exports.addEventListener(t, e, n)
              }, e.prototype.calcWindowHeight = function() {
                  return innerHeight
              }, e.prototype.calcWindowWidth = function() {
                  return innerWidth
              }, e.prototype.calcScreenHeight = function() {
                  return "portrait" === this.detectOrientation() ? Math.max(screen.availHeight, screen.availWidth) : Math.min(screen.availHeight, screen.availWidth)
              }, e.prototype.detectOrientation = function() {
                  return this.calcWindowHeight() > this.calcWindowWidth() ? "portrait" : "landscape"
              }, e.prototype.isVisible = function(t) {
                  return !!(t.offsetWidth || t.offsetHeight || t.getClientRects().length)
              }, e.prototype.reverseChildren = function(t) {
                  var e,
                      n,
                      i,
                      r;
                  for (r = [], n = e = 0, i = t.childNodes.length - 1; 0 <= i ? e <= i : e >= i; n = 0 <= i ? ++e : --e)
                      r.push(t.insertBefore(t.childNodes[n], t.firstChild));
                  return r
              }, e.prototype.getElement = function(t) {
                  return t instanceof HTMLElement ? t : document.querySelector(t)
              }, e
          }()
      }.call(this),
      function() {
          var t = Date.now || function() {
                  return (new Date).getTime()
              },
              e = function(e, n, i) {
                  var r,
                      o,
                      s,
                      a = null,
                      u = 0;
                  i || (i = {});
                  var l = function() {
                      u = i.leading === !1 ? 0 : t(),
                      a = null,
                      s = e.apply(r, o),
                      a || (r = o = null)
                  };
                  return function() {
                      var c = t();
                      u || i.leading !== !1 || (u = c);
                      var d = n - (c - u);
                      return r = this, o = arguments, d <= 0 || d > n ? (a && (clearTimeout(a), a = null), u = c, s = e.apply(r, o), a || (r = o = null)) : a || i.trailing === !1 || (a = setTimeout(l, d)), s
                  }
              };
          exports.throttle = e
      }(),
      function() {
          var t = function(t, e) {
              return function() {
                  return t.apply(e, arguments)
              }
          };
          exports.TypingIndicator = function() {
              function e(e, n) {
                  this._bindTypingEvents = t(this._bindTypingEvents, this),
                  this._handleWebSocketMessage = t(this._handleWebSocketMessage, this);
                  var i;
                  i = e.BROWSER_SUPPORT.features.webSocket && e.BROWSER_SUPPORT.features.cors && e.BROWSER_SUPPORT.features.json,
                  i && (this.$el = n.$el, this.config = e, this.pusherData = JSON.parse(this.$el.getAttribute("data-pusher")), this.ws = new WebSocket(this.pusherData.web_socket_url), this.ws.onmessage = this._handleWebSocketMessage)
              }
              return e.prototype._handleWebSocketMessage = function(t) {
                  var e;
                  return e = JSON.parse(t.data), "string" == typeof e.data && (e.data = JSON.parse(e.data)), "pusher_internal:subscription_succeeded" === e.event ? this._bindTypingEvents() : "pusher:connection_established" === e.event ? exports.utils.ajaxSimpleCors({
                      method: "POST",
                      url: this.pusherData.auth_url,
                      withCredentials: /^staging/.test(this.config.ENV),
                      body: {
                          survey_request_token: this.pusherData.survey_request_token,
                          socket_id: e.data.socket_id,
                          channel_name: this.pusherData.channel_name
                      },
                      callback: function(t) {
                          return function(e) {
                              var n;
                              return n = {
                                  event: "pusher:subscribe",
                                  data: {
                                      auth: e.auth,
                                      channel: t.pusherData.channel_name
                                  }
                              }, t.ws.send(JSON.stringify(n))
                          }
                      }(this)
                  }) : void 0
              }, e.prototype._bindTypingEvents = function() {
                  var t,
                      e,
                      n,
                      i;
                  return i = 0, n = 1e3, t = function(t) {
                      return function() {
                          var e;
                          if (!(i >= n))
                              return e = {
                                  event: "client-typing",
                                  channel: t.pusherData.channel_name,
                                  data: {
                                      survey_request_token: t.pusherData.survey_request_token
                                  }
                              }, t.ws.send(JSON.stringify(e)), i += 1
                      }
                  }(this), e = exports.throttle(t, 2e3), exports.addEventListener(this.$el, "input", e)
              }, e
          }()
      }.call(this),
      function() {
          var t = function(t, e) {
              return function() {
                  return t.apply(e, arguments)
              }
          };
          this.AdditionalQuestionsOptions = function() {
              function e(e) {
                  this._handleOptionSelected = t(this._handleOptionSelected, this);
                  var n,
                      i,
                      r,
                      o;
                  if (this.dom = new exports.DomHelpers, this.$container = this.dom.getElement(e), this.$container) {
                      for (this.$options = this.$container.querySelectorAll("input"), o = this.$options, i = 0, r = o.length; i < r; i++)
                          n = o[i],
                          this.dom.bindEvent(n, "change", this._handleOptionSelected);
                      this._handleOptionSelected()
                  }
              }
              return e.prototype._handleOptionSelected = function() {
                  var t,
                      e,
                      n,
                      i,
                      r;
                  for (r = this.$options, e = 0, i = r.length; e < i; e++)
                      t = r[e],
                      n = t.parentElement.querySelector(".survey-response-input textarea"),
                      n && (t.checked ? n.classList.remove("is-hidden") : n.classList.add("is-hidden"))
              }, e
          }()
      }.call(this),
      function() {
          var t = function(t, e) {
              return function() {
                  return t.apply(e, arguments)
              }
          };
          this.AdditionalQuestionsScale = function() {
              function e(e) {
                  this._handleScaleSelected = t(this._handleScaleSelected, this);
                  var n,
                      i,
                      r,
                      o;
                  if (this.dom = new exports.DomHelpers, this.$container = this.dom.getElement(e), this.$container) {
                      for (this.$scales = this.$container.querySelectorAll("input"), o = this.$scales, i = 0, r = o.length; i < r; i++)
                          n = o[i],
                          this.dom.bindEvent(n, "change", this._handleScaleSelected);
                      this.$container.querySelector("input:checked") && this._handleScaleSelected()
                  }
              }
              return e.prototype._handleScaleSelected = function() {
                  this.$container.classList.add("is-active")
              }, e
          }()
      }.call(this),
      function() {
          var t = function(t, e) {
              return function() {
                  return t.apply(e, arguments)
              }
          };
          exports.DisplayStrategy = function() {
              function e(e, n) {
                  this._setupTypingIndicator = t(this._setupTypingIndicator, this),
                  this._disableMask = t(this._disableMask, this),
                  this._resizeMask = t(this._resizeMask, this),
                  this._computeMaskHeight = t(this._computeMaskHeight, this),
                  this._setupMask = t(this._setupMask, this),
                  this._pseudoBlurCommentBox = t(this._pseudoBlurCommentBox, this),
                  this._pseudoFocusCommentBox = t(this._pseudoFocusCommentBox, this),
                  this._surveyAqIsVisible = t(this._surveyAqIsVisible, this),
                  this._surveyIsVisible = t(this._surveyIsVisible, this),
                  this._surveyHasFocus = t(this._surveyHasFocus, this),
                  this._setupEventHandlers = t(this._setupEventHandlers, this),
                  this._injectThankYouTemplate = t(this._injectThankYouTemplate, this),
                  this._filterSavedAnswer = t(this._filterSavedAnswer, this),
                  this._fillInSavedAnswer = t(this._fillInSavedAnswer, this),
                  this._bindAdditionalQuestionSubmit = t(this._bindAdditionalQuestionSubmit, this),
                  this._bindAdditionalQuestionPreviousLink = t(this._bindAdditionalQuestionPreviousLink, this),
                  this._getFormParams = t(this._getFormParams, this),
                  this._injectAdditionalQuestionTemplate = t(this._injectAdditionalQuestionTemplate, this),
                  this._skipComment = t(this._skipComment, this),
                  this._confirmationText = t(this._confirmationText, this),
                  this._clearScore = t(this._clearScore, this),
                  this._setScore = t(this._setScore, this),
                  this._getScore = t(this._getScore, this),
                  this._measure = t(this._measure, this),
                  this._injectTemplate = t(this._injectTemplate, this),
                  this._removeModal = t(this._removeModal, this),
                  this._remove = t(this._remove, this),
                  this._getTemplate = t(this._getTemplate, this),
                  this.toggleStateForPreview = t(this.toggleStateForPreview, this),
                  this.canHide = t(this.canHide, this);
                  var i;
                  this.config = e,
                  this.opts = n,
                  (i = this.opts).offsets || (i.offsets = {}),
                  this.timingFactor = 1,
                  this.transitionDuration = .5 * this.timingFactor,
                  this.transitionEasing = "cubic-bezier(0.32, 0.6, 0.08, 1.00)",
                  this.dom = new exports.DomHelpers(this.config),
                  this.state = "initial",
                  this.hasAdditionalQuestions = !1
              }
              return e.prototype.canHide = function() {
                  return "question" === this.state || "toast" === this.state
              }, e.prototype.toggleStateForPreview = function(t, e, n) {
                  var i,
                      r,
                      o;
                  if (null == n && (n = {}), i = t.slice(), r = this.state.slice(), i !== r)
                      switch (this.config.LOGGER.debug("Toggling '" + r + "' -> '" + i + "'."), this.score && (e = this.score), o = r + " -> " + i) {
                      case "toast -> question":
                          return this._showQuestion();
                      case "toast -> comment":
                          return this._showComment(e);
                      case "question -> toast":
                          return this._hideQuestion();
                      case "question -> comment":
                          return this._showComment(e);
                      case "comment -> question":
                          return n.disableClearScoreOnHideComment || this._clearScore(), this._showQuestion();
                      case "comment -> toast":
                          return n.disableClearScoreOnHideComment || this._clearScore(), this._hideComment();
                      default:
                          return this.config.LOGGER.error("Cannot toggle '" + r + "' -> '" + i + "'.")
                      }
              }, e.prototype._getTemplate = function(t) {
                  var e;
                  return e = function(e) {
                      return function(n) {
                          return e.token = n.token, t(n)
                      }
                  }(this), this.config.SURVEY_TEMPLATE ? e(this.config.SURVEY_TEMPLATE) : (this.config.TELEMETRY.instrument("GET_TEMPLATE_START", {
                      token: this.opts.params._delighted_survey_request_token
                  }), exports.utils.ajaxSimpleCors({
                      method: "POST",
                      url: this.config.SURVEY_URL,
                      body: this.opts.params,
                      withCredentials: /^staging/.test(this.config.ENV),
                      callback: function(t) {
                          return function(n) {
                              return n.abort ? (t.config.TELEMETRY.instrument("GET_TEMPLATE_ABORT", {
                                  reason: n.reason
                              }), t.config.LOGGER.warn("Survey cancelled because " + n.reason + "."), null != n.last_surveyed_timestamp ? t.config.STATE_MANAGER.setLastSurveyedTimestamp(1e3 * n.last_surveyed_timestamp, {
                                  token: n.last_surveyed_token
                              }) : void 0) : (t.config.TELEMETRY.instrument("GET_TEMPLATE_OK", {
                                  token: n.token
                              }), e(n))
                          }
                      }(this),
                      onRedirect: function(t) {
                          return function(e) {
                              return t.config.TELEMETRY.instrument("GET_TEMPLATE_REDIRECT", {
                                  original_url: t.config.SURVEY_URL,
                                  redirect_url: e.redirect_url
                              })
                          }
                      }(this)
                  }))
              }, e.prototype._remove = function() {
                  return exports.requestAnimationFrame(function(t) {
                      return function() {
                          return exports.utils.timeout(1e3 * t.transitionDuration, function() {
                              if (t.$root)
                                  return t.$root.parentNode.removeChild(t.$root), t.$root = null
                          })
                      }
                  }(this))
              }, e.prototype._removeModal = function() {
                  return exports.requestAnimationFrame(function(t) {
                      return function() {
                          return exports.utils.timeout(1e3 * t.transitionDuration, function() {
                              if (t.$rootModal)
                                  return t.$rootModal.parentNode.removeChild(t.$rootModal), t.$rootModal = null
                          })
                      }
                  }(this))
              }, e.prototype._injectTemplate = function(t) {
                  var e;
                  return document.body.insertAdjacentHTML("beforeend", t.html), this.$root = document.querySelector("#delighted-web-" + t.id), this.$rootModal = document.querySelector("#delighted-web-modal-" + t.id), this.$survey = this.$root.querySelector(".delighted-web-survey"), this.$surveyInner = this.$root.querySelector(".delighted-web-survey-inner"), this.$surveyPowered = this.$root.querySelector(".delighted-web-survey-powered"), this.$surveyClose = this.$root.querySelector(".delighted-web-survey-close"), this.$stepQuestion = this.$root.querySelector(".delighted-web-step-question"), this.$stepComment = this.$root.querySelector(".delighted-web-step-comment"), this.$stepThanks = this.$root.querySelector(".delighted-web-step-thanks"), this.$stepAdditionalQuestion = this.$rootModal.querySelector(".delighted-web-aq-content"), this.$stepAdditionalQuestionClose = this.$rootModal.querySelector(".delighted-web-aq-close"), this.$surveyModalClose = this.$rootModal.querySelector(".delighted-web-survey-close"), e = this.$root.querySelector(".delighted-web-label-comment").getAttribute("data-text"), this._confirmationTextByScore = JSON.parse(e), this._setupMask()
              }, e.prototype._measure = function() {
                  return this.heightSurvey = this.$survey.offsetHeight, this.heightStepQuestion = this.$stepQuestion.offsetHeight, this.heightStepComment = this.$stepComment.offsetHeight, this.heightStepThanks = this.$stepThanks.offsetHeight
              }, e.prototype._getScore = function(t) {
                  return {
                      text: t.innerText,
                      number: parseInt(t.getAttribute("data-score"), 10)
                  }
              }, e.prototype._setScore = function(t) {
                  var e,
                      n,
                      i,
                      r,
                      o;
                  if (t) {
                      for (this.score = t, o = this.$stepQuestion.querySelectorAll(".delighted-web-question-score-number"), n = 0, i = o.length; n < i; n++)
                          e = o[n],
                          t.number === this._getScore(e).number ? (e.classList.remove("delighted-web-is-inactive"), e.classList.add("delighted-web-is-active")) : (e.classList.add("delighted-web-is-inactive"), e.classList.remove("delighted-web-is-active"));
                      return this.$stepQuestion.querySelector(".delighted-web-question-score-numbers").classList.add("delighted-web-is-active"), this.$stepComment.querySelector(".delighted-web-label-comment").innerText = this._confirmationText(t), (r = this.$surveyPowered.getAttribute("data-url-tail")) ? this.$surveyPowered.href = r : void 0
                  }
              }, e.prototype._clearScore = function() {
                  var t,
                      e,
                      n,
                      i;
                  for (this.score = null, i = this.$stepQuestion.querySelectorAll(".delighted-web-question-score-number"), e = 0, n = i.length; e < n; e++)
                      t = i[e],
                      t.classList.remove("delighted-web-is-inactive"),
                      t.classList.remove("delighted-web-is-active");
                  return this.$stepQuestion.querySelector(".delighted-web-question-score-numbers").classList.remove("delighted-web-is-active")
              }, e.prototype._confirmationText = function(t) {
                  return this._confirmationTextByScore[t.number]
              }, e.prototype._skipComment = function(t) {
                  return this.config.PREVIEW_MODE ? this.config.SKIP_COMMENT_STEP : t.redirect_after_comment
              }, e.prototype._injectAdditionalQuestionTemplate = function(t) {
                  var e,
                      n,
                      i;
                  this.$stepAdditionalQuestion.innerHTML = t,
                  this._bindAdditionalQuestionSubmit(),
                  n = this.$stepAdditionalQuestion.querySelector(".delighted-web-aq-prev-link"),
                  n && this._bindAdditionalQuestionPreviousLink(n),
                  this._fillInSavedAnswer(),
                  new AdditionalQuestionsOptions(this.$stepAdditionalQuestion),
                  i = this.$stepAdditionalQuestion.querySelector(".delighted-web-aq-toggle-panels-scale"),
                  i && new AdditionalQuestionsScale(i),
                  e = this.$stepAdditionalQuestion.querySelector("input[type=email],input[type=text],textarea:not(.is-hidden)"),
                  e && e.focus()
              }, e.prototype._getFormParams = function(t) {
                  var e,
                      n,
                      i,
                      r,
                      o,
                      s;
                  for (n = t.querySelectorAll("input[type=email],input[type=text],textarea,input[type=checkbox]:checked,input[type=radio]:checked"), s = {}, i = 0, r = n.length; i < r; i++)
                      e = n[i],
                      "[]" === e.name.slice(-2) ? (o = e.name.slice(0, -2), s[o] ? s[o].push(e.value) : s[o] = [e.value]) : s[e.name] = e.value;
                  return s
              }, e.prototype._bindAdditionalQuestionPreviousLink = function(t) {
                  return this.dom.bindEvent(t, "click", function(e) {
                      return function() {
                          var n;
                          if (!e.isLoadingAdditionalQuestion)
                              return e.isLoadingAdditionalQuestion = !0, n = t.parentNode.dataset.url, exports.utils.ajaxSimpleCors({
                                  method: "GET",
                                  url: n,
                                  withCredentials: /^staging/.test(e.config.ENV),
                                  callback: function(t) {
                                      if (e.isLoadingAdditionalQuestion = !1, t.aq_html)
                                          return e._injectAdditionalQuestionTemplate(t.aq_html)
                                  }
                              })
                      }
                  }(this))
              }, e.prototype._bindAdditionalQuestionSubmit = function() {
                  return this.dom.bindEvent(this.$stepAdditionalQuestion.querySelector("form"), "submit", function(t) {
                      return function(e) {
                          var n,
                              i,
                              r;
                          if (!t.isLoadingAdditionalQuestion)
                              return t.isLoadingAdditionalQuestion = !0, e.preventDefault(), t.$stepAdditionalQuestion.querySelector(".delighted-web-btn").classList.add("delighted-web-btn-disabled"), n = e.target, r = t._getFormParams(n), exports.utils.ajaxSimpleCors({
                                  method: "PUT",
                                  url: n.action,
                                  body: r,
                                  qsOpts: {
                                      arrayFormat: "brackets"
                                  },
                                  withCredentials: /^staging/.test(t.config.ENV),
                                  callback: function(e) {
                                      return t.isLoadingAdditionalQuestion = !1, e.aq_html ? (t._injectAdditionalQuestionTemplate(e.aq_html), t.config.STATE_MANAGER.setSavedAnswer(n.dataset.questionId, t._filterSavedAnswer(r))) : t._showThanks()
                                  }
                              }), "function" == typeof (i = t.opts).onAqAnswer ? i.onAqAnswer({
                                  token: t.token,
                                  question_id: n.dataset.questionId,
                                  answer: r
                              }) : void 0
                      }
                  }(this))
              }, e.prototype._fillInSavedAnswer = function() {
                  var t,
                      e,
                      n,
                      i,
                      r,
                      o,
                      s,
                      a;
                  if (t = this.$stepAdditionalQuestion.querySelector("form"), i = t.dataset.questionId, r = t.dataset.questionType, e = this.config.STATE_MANAGER.getSavedAnswer(i)) {
                      switch (r) {
                      case "scale":
                      case "select_one":
                          null != (o = t.querySelector("[name='additional_question_answer'][value='" + e.additional_question_answer + "']")) && (o.checked = !0);
                          break;
                      case "select_many":
                          n = Array.prototype.slice.call(e.additional_question_answer || []),
                          n.forEach(function() {
                              return function(e) {
                                  var n;
                                  return null != (n = t.querySelector("[name='additional_question_answer[]'][value='" + e + "']")) ? n.checked = !0 : void 0
                              }
                          }(this));
                          break;
                      default:
                          null != (s = t.querySelector("#additional_question_answer")) && (s.value = e.additional_question_answer)
                      }
                      a = Array.prototype.slice.call(t.querySelectorAll("textarea") || []),
                      a.forEach(function() {
                          return function(t) {
                              if (e[t.name])
                                  return t.value = e[t.name]
                          }
                      }(this))
                  }
              }, e.prototype._filterSavedAnswer = function(t) {
                  return Object.keys(t).filter(function(t) {
                      return "_method" !== t
                  }).reduce(function(e, n) {
                      return e[n] = t[n], e
                  }, {})
              }, e.prototype._injectThankYouTemplate = function(t) {
                  return this.$stepThanks.innerHTML = t, this._measure()
              }, e.prototype._setupEventHandlers = function() {
                  var t,
                      e,
                      n,
                      i,
                      r;
                  for (r = this.$stepQuestion.querySelectorAll(".delighted-web-question-score-number"), e = function(t) {
                      return function(e) {
                          return t.dom.bindEvent(e, "click", function(n) {
                              var i,
                                  r,
                                  o;
                              return n.preventDefault(), r = t._getScore(e), o = e.getAttribute("data-url"), exports.utils.ajaxSimpleCors({
                                  url: o,
                                  withCredentials: /^staging/.test(t.config.ENV),
                                  callback: function(e) {
                                      return t.$stepComment.querySelector(".delighted-web-comment-submit").innerText = e.button_submit_label, e.aq_html && (t.hasAdditionalQuestions = !0,
                                      t._injectAdditionalQuestionTemplate(e.aq_html)), "thanks" !== t.state && t._injectThankYouTemplate(e.thank_you_html), t.$stepComment.querySelector(".delighted-web-comment").action = o, t._skipComment(e) ? (t.skipComment = !0, t.hasAdditionalQuestions ? t._showAdditionalQuestion() : t._showThanks()) : t._showComment(r)
                                  }
                              }), "function" == typeof (i = t.opts).onRespond && i.onRespond({
                                  token: t.token,
                                  score: r.number
                              }), exports.utils.timeout(t.transitionDuration, t._setupTypingIndicator)
                          })
                      }
                  }(this), n = 0, i = r.length; n < i; n++)
                      t = r[n],
                      e(t);
                  return this.dom.bindEvent(this.$stepComment.querySelector(".delighted-web-comment"), "submit", function(t) {
                      return function(e) {
                          var n,
                              i,
                              r,
                              o,
                              s,
                              a,
                              u;
                          for (e.preventDefault(), i = e.target, o = {}, u = i.querySelectorAll("input, textarea"), s = 0, a = u.length; s < a; s++)
                              n = u[s],
                              o[n.name] = n.value;
                          return exports.utils.ajaxSimpleCors({
                              method: "PUT",
                              url: i.action,
                              body: o,
                              withCredentials: /^staging/.test(t.config.ENV)
                          }), t.hasAdditionalQuestions ? t._showAdditionalQuestion() : t._showThanks(), "function" == typeof (r = t.opts).onComment ? r.onComment({
                              token: t.token
                          }) : void 0
                      }
                  }(this)), this.dom.bindEvent(this.$stepComment.querySelector(".delighted-web-comment-box"), "focus", this._pseudoFocusCommentBox), this.dom.bindEvent(this.$stepComment.querySelector(".delighted-web-comment-box"), "blur", this._pseudoBlurCommentBox), this.dom.bindEvent(this.$surveyClose, "click", function(t) {
                      return function() {
                          return t.hide({
                              source: "close"
                          })
                      }
                  }(this)), this.dom.bindEvent(this.$stepAdditionalQuestionClose, "click", function(t) {
                      return function() {
                          return t.hide({
                              source: "close_additional_questions"
                          })
                      }
                  }(this)), this.dom.bindEvent(document, "keyup", function(t) {
                      return function(e) {
                          if (27 === e.keyCode) {
                              if (t._surveyIsVisible() && t._surveyHasFocus())
                                  return t.hide({
                                      source: "close"
                                  });
                              if (t._surveyAqIsVisible())
                                  return t.hide({
                                      source: "close_additional_questions"
                                  })
                          }
                      }
                  }(this)), this.dom.bindEvent(window, "click", function(t) {
                      return function(e) {
                          if (t.$rootModal && e.target === t.$rootModal)
                              return t.hide({
                                  source: "close_additional_questions"
                              })
                      }
                  }(this))
              }, e.prototype._surveyHasFocus = function() {
                  return this.$root.contains(document.activeElement)
              }, e.prototype._surveyIsVisible = function() {
                  return this.dom.isVisible(this.$root)
              }, e.prototype._surveyAqIsVisible = function() {
                  return this.dom.isVisible(this.$rootModal)
              }, e.prototype._pseudoFocusCommentBox = function() {
                  return this.$stepComment.querySelector(".delighted-web-comment-box").classList.add("delighted-web-is-focus")
              }, e.prototype._pseudoBlurCommentBox = function() {
                  return this.$stepComment.querySelector(".delighted-web-comment-box").classList.remove("delighted-web-is-focus")
              }, e.prototype._setupMask = function() {
                  return null != this.opts.offsets.bottom && this.opts.offsets.bottom > 0 ? this.dom.setStyle(this.$root, "bottom", this.opts.offsets.bottom + "px") : this.dom.setStyle(this.$root, "overflow", "visible")
              }, e.prototype._computeMaskHeight = function(t) {
                  return t + 16
              }, e.prototype._resizeMask = function(t, e) {
                  var n,
                      i,
                      r,
                      o;
                  return null == e && (e = !0), i = this.$root.offsetHeight, n = this._computeMaskHeight(t), r = n > i, o = function(t) {
                      return function() {
                          return t.dom.setStyle(t.$root, "height", n + "px"), t._measure()
                      }
                  }(this), r || !e ? o() : exports.utils.timeout(1e3 * this.transitionDuration, o)
              }, e.prototype._disableMask = function() {
                  return this.dom.setStyle(this.$root, "height", "auto"), this.dom.setStyle(this.$root, "overflow", "visible"), this.dom.setStyle(this.$root, "bottom", 0)
              }, e.prototype._setupTypingIndicator = function() {
                  if (!this.hasSetupTypingIndicator)
                      return this.hasSetupTypingIndicator = !0, new exports.TypingIndicator(this.config, {
                          $el: this.$stepComment.querySelector(".delighted-web-comment-box")
                      })
              }, e
          }()
      }.call(this),
      function() {
          var t = function(t, e) {
                  return function() {
                      return t.apply(e, arguments)
                  }
              },
              e = function(t, e) {
                  function i() {
                      this.constructor = t
                  }
                  for (var r in e)
                      n.call(e, r) && (t[r] = e[r]);
                  return i.prototype = e.prototype, t.prototype = new i, t.__super__ = e.prototype, t
              },
              n = {}.hasOwnProperty;
          exports.DisplayStrategyDesktop = function(n) {
              function i() {
                  this._autoSizeQuestionLabel = t(this._autoSizeQuestionLabel, this),
                  this._animateBtns = t(this._animateBtns, this),
                  this._resetBtnsAnimation = t(this._resetBtnsAnimation, this),
                  this._setupEventHandlers = t(this._setupEventHandlers, this),
                  this._injectTemplate = t(this._injectTemplate, this),
                  this._showThanks = t(this._showThanks, this),
                  this._showAdditionalQuestion = t(this._showAdditionalQuestion, this),
                  this._hideComment = t(this._hideComment, this),
                  this._showComment = t(this._showComment, this),
                  this._showQuestion = t(this._showQuestion, this),
                  this.hideModal = t(this.hideModal, this),
                  this.hide = t(this.hide, this),
                  this.show = t(this.show, this),
                  i.__super__.constructor.apply(this, arguments),
                  this.autoHideDelay = 2 * this.timingFactor,
                  this.opacityTransitionDuration = .15 * this.timingFactor,
                  this.opacityTransitionEasing = "ease-in-out"
              }
              return e(i, n), i.prototype.show = function() {
                  return this._getTemplate(function(t) {
                      return function(e) {
                          return t._injectTemplate(e), t._measure(), t._setupEventHandlers(), t._showQuestion()
                      }
                  }(this))
              }, i.prototype.hide = function(t) {
                  return null == t && (t = {}), this.state = "hidden", exports.requestAnimationFrame(function(e) {
                      return function() {
                          return e.hideModal(), e.dom.setOpacity(e.$survey, 1), exports.requestAnimationFrame(function() {
                              var n;
                              return e.dom.transition(e.$survey, "transform " + e.transitionDuration + "s " + e.transitionEasing + " 0s, opacity " + e.opacityTransitionDuration + "s " + e.opacityTransitionEasing + " " + (e.transitionDuration - e.opacityTransitionDuration) / 5 + "s"), e.dom.setOpacity(e.$survey, 0), e.dom.translateY(e.$survey, e.heightSurvey), e._remove(), "function" == typeof (n = e.opts).onHide ? n.onHide({
                                  token: e.token,
                                  source: t.source
                              }) : void 0
                          })
                      }
                  }(this))
              }, i.prototype.hideModal = function() {
                  return exports.requestAnimationFrame(function(t) {
                      return function() {
                          if (t.$rootModal)
                              return t.dom.setOpacity(t.$rootModal, 1), exports.requestAnimationFrame(function() {
                                  if (t.$rootModal)
                                      return t.dom.transition(t.$rootModal, "opacity " + t.opacityTransitionDuration + "s " + t.opacityTransitionEasing + " " + (t.transitionDuration - t.opacityTransitionDuration) / 5 + "s"), t.dom.setOpacity(t.$rootModal, 0), t._removeModal()
                              })
                      }
                  }(this))
              }, i.prototype._showQuestion = function(t) {
                  return "comment" === this.state ? void this._hideComment() : (this.state = "question", exports.requestAnimationFrame(function(e) {
                      return function() {
                          return e.$stepQuestion.classList.add("delighted-web-is-shown"), e._autoSizeQuestionLabel(), e._measure(), e.dom.setStyle(e.$root, "visibility", "visible"), e.dom.transition(e.$survey, "none"), e.dom.translateY(e.$survey, e.heightSurvey), exports.requestAnimationFrame(function() {
                              var n;
                              return e.opts.disableShowAnimations || e.dom.transition(e.$survey, "transform " + e.transitionDuration + "s " + e.transitionEasing + " 0s"), e.dom.setOpacity(e.$survey, 1), e.dom.translateY(e.$survey, e.heightSurvey - e.heightStepQuestion), e.dom.translateY(e.$surveyPowered, -(e.heightSurvey - e.heightStepQuestion)), e._resizeMask(e.heightStepQuestion), e.opts.disableShowAnimations || e._animateBtns(), "function" == typeof (n = e.opts).onShow && n.onShow({
                                  token: e.token
                              }), "function" == typeof t ? t() : void 0
                          })
                      }
                  }(this)))
              }, i.prototype._showComment = function(t) {
                  return this.state = "comment", exports.requestAnimationFrame(function(e) {
                      return function() {
                          var n,
                              i;
                          return e._setScore(t), e.opts.disableShowCommentAnimations || e.dom.transition(e.$survey, "transform " + e.transitionDuration + "s " + e.transitionEasing + " 0s"), e.dom.translateY(e.$survey, e.heightSurvey - e.heightStepQuestion - e.heightStepComment), e.opts.disableShowCommentAnimations || e.dom.transition(e.$surveyPowered, "transform " + e.transitionDuration + "s " + e.transitionEasing + " 0s"), e.dom.translateY(e.$surveyPowered, -(e.heightSurvey - e.heightStepQuestion - e.heightStepComment)), e._resizeMask(e.heightStepQuestion + e.heightStepComment), i = e.opts.disableShowCommentAnimations ? 0 : 1e3 * e.transitionDuration, exports.utils.timeout(i, function() {
                              return e.$stepComment.querySelector(".delighted-web-comment-box").focus()
                          }), e._pseudoFocusCommentBox(), e.$stepComment.querySelector(".delighted-web-comment-box").setAttribute("tabindex", "0"), e.$stepComment.querySelector(".delighted-web-comment-submit").setAttribute("tabindex", "0"), "function" == typeof (n = e.opts).onShowComment ? n.onShowComment() : void 0
                      }
                  }(this))
              }, i.prototype._hideComment = function() {
                  return "comment" !== this.state ? void this.config.LOGGER.error("Must be in 'comment' state to hide comment (was '" + this.state + "').") : (this.state = "question", exports.requestAnimationFrame(function(t) {
                      return function() {
                          return t.$stepComment.querySelector(".delighted-web-comment-box").blur(), t.dom.transition(t.$survey, "transform " + t.transitionDuration + "s " + t.transitionEasing + " 0s"), t.dom.translateY(t.$survey, t.heightSurvey - t.heightStepQuestion), t.dom.transition(t.$surveyPowered, "transform " + t.transitionDuration + "s " + t.transitionEasing + " 0s"), t.dom.translateY(t.$surveyPowered, -(t.heightSurvey - t.heightStepQuestion)), t._resizeMask(t.heightStepQuestion)
                      }
                  }(this)))
              }, i.prototype._showAdditionalQuestion = function() {
                  return this.state = "additional_question", exports.requestAnimationFrame(function(t) {
                      return function() {
                          var e;
                          return t.dom.setOpacity(t.$stepQuestion, 1), t.dom.setOpacity(t.$stepComment, 1), t.dom.setOpacity(t.$rootModal, 0), t.dom.setStyle(t.$rootModal, "visibility", "visible"), t._measure(), e = t.skipComment ? 0 : t.heightStepComment, t.dom.transition(t.$survey, "none"), t.dom.translateY(t.$survey, t.heightSurvey - t.heightStepQuestion - e), t.dom.transition(t.$surveyPowered, "none"), t.dom.translateY(t.$surveyPowered, -(t.heightSurvey - t.heightStepQuestion - e)), exports.requestAnimationFrame(function() {
                              return t.dom.transition(t.$rootModal, "opacity " + t.opacityTransitionDuration + "s " + t.opacityTransitionEasing + " " + (t.transitionDuration - t.opacityTransitionDuration) / 5 + "s"), t.dom.setOpacity(t.$rootModal, 1), t.dom.transition(t.$stepQuestion, "opacity " + t.opacityTransitionDuration + "s " + t.opacityTransitionEasing + " 0s"), t.dom.setOpacity(t.$stepQuestion, 0), t.dom.transition(t.$stepComment, "opacity " + t.opacityTransitionDuration + "s " + t.opacityTransitionEasing + " 0s"), t.dom.setOpacity(t.$stepComment, 0), t.dom.transition(t.$survey, "transform " + t.transitionDuration + "s " + t.transitionEasing + " 0s"), t.dom.translateY(t.$survey, t.heightSurvey), t.dom.transition(t.$surveyPowered, "transform " + t.transitionDuration + "s " + t.transitionEasing + " 0s"), t.dom.translateY(t.$surveyPowered, -t.heightSurvey), t._resizeMask(t.heightSurvey - t.heightStepQuestion - t.heightStepComment)
                          })
                      }
                  }(this))
              }, i.prototype._showThanks = function() {
                  return this.state = "thanks", exports.requestAnimationFrame(function(t) {
                      return function() {
                          var e,
                              n,
                              i;
                          return t.dom.setOpacity(t.$stepQuestion, 1), t.dom.setOpacity(t.$stepComment, 1), t.dom.setOpacity(t.$stepThanks, 0), t.hideModal(), n = t.skipComment ? 0 : t.heightStepComment, e = t.$stepThanks.querySelector(".delighted-web-thanks"), i = e.classList.contains("delighted-web-thanks-custom"), t.dom.setStyle(e, "display", "block"), t._measure(), t.dom.transition(t.$survey, "none"), t.dom.translateY(t.$survey, t.heightSurvey - t.heightStepQuestion - n), t.dom.transition(t.$surveyPowered, "none"), t.dom.translateY(t.$surveyPowered, -(t.heightSurvey - t.heightStepQuestion - n)), i || (t.dom.setOpacity(t.$surveyPowered, 1), t.dom.setOpacity(t.$surveyClose, 1)), exports.requestAnimationFrame(function() {
                              if (t.dom.transition(t.$stepQuestion, "opacity " + t.opacityTransitionDuration + "s " + t.opacityTransitionEasing + " 0s"), t.dom.setOpacity(t.$stepQuestion, 0), t.dom.transition(t.$stepComment, "opacity " + t.opacityTransitionDuration + "s " + t.opacityTransitionEasing + " 0s"), t.dom.setOpacity(t.$stepComment, 0), t.dom.transition(t.$stepThanks, "opacity " + t.opacityTransitionDuration + "s " + t.opacityTransitionEasing + " 0s"), t.dom.setOpacity(t.$stepThanks, 1), t.dom.translateY(t.$stepThanks, -(t.heightStepQuestion + t.heightStepComment)), t.dom.transition(t.$survey, "transform " + t.transitionDuration + "s " + t.transitionEasing + " 0s"), t.dom.translateY(t.$survey, t.heightSurvey - t.heightStepThanks), t.dom.transition(t.$surveyPowered, "transform " + t.transitionDuration + "s " + t.transitionEasing + " 0s"), t.dom.translateY(t.$surveyPowered, -(t.heightSurvey - t.heightStepThanks)), t._resizeMask(t.heightSurvey - t.heightStepQuestion - t.heightStepComment), !i)
                                  return t.dom.transition(t.$surveyPowered, "opacity " + t.opacityTransitionDuration + "s " + t.opacityTransitionEasing + " 0s"), t.dom.setOpacity(t.$surveyPowered, 0), t.dom.transition(t.$surveyClose, "opacity " + t.opacityTransitionDuration + "s " + t.opacityTransitionEasing + " 0s"), t.dom.setOpacity(t.$surveyClose, 0), exports.utils.timeout(1e3 * (t.transitionDuration + t.autoHideDelay), function() {
                                      return t.hide({
                                          source: "auto_hide"
                                      })
                                  })
                          })
                      }
                  }(this))
              }, i.prototype._injectTemplate = function() {
                  if (i.__super__._injectTemplate.apply(this, arguments), this.dom.setStyle(this.$survey, "display", "block"), this.$root.classList.add("delighted-web-desktop"), this.$rootModal.classList.add("delighted-web-desktop"), this.opts.darkBackground === !0)
                      return this.$rootModal.classList.add("delighted-web-modal-dark")
              }, i.prototype._setupEventHandlers = function() {
                  var t,
                      e;
                  return i.__super__._setupEventHandlers.apply(this, arguments), this.dom.bindEvent(this.$root.querySelector(".delighted-web-label-question"), "click", function(t) {
                      return function() {
                          return exports.requestAnimationFrame(function() {
                              return t._resetBtnsAnimation(), exports.requestAnimationFrame(function() {
                                  return t._animateBtns()
                              })
                          })
                      }
                  }(this)), t = this.$stepComment.querySelector(".delighted-web-comment-box"), e = this.$root.querySelector(".delighted-web-label-comment"), this.dom.bindEvent(t, "input", function(n) {
                      return function() {
                          var i;
                          return i = "" === t.value ? "block" : "none", n.dom.setStyle(e, "display", i)
                      }
                  }(this))
              }, i.prototype._resetBtnsAnimation = function() {
                  var t,
                      e,
                      n,
                      i,
                      r,
                      o,
                      s;
                  if (this.config.BROWSER_SUPPORT.features.animation) {
                      for (e = this.$stepQuestion.querySelectorAll(".delighted-web-question-score-number"), n = e.length, s = [], r = i = 0, o = e.length; i < o; r = ++i)
                          t = e[r],
                          s.push(this.dom.setStyle(t, "animation", "none"));
                      return s
                  }
              }, i.prototype._animateBtns = function() {
                  var t,
                      e,
                      n,
                      i,
                      r,
                      o,
                      s,
                      a,
                      u,
                      l;
                  if (this.config.BROWSER_SUPPORT.features.animation) {
                      for (e = this.$stepQuestion.querySelectorAll(".delighted-web-question-score-number"), i = e.length, n = this.opts.buttonAnimationDirection, r = (.65 * this.transitionDuration).toFixed(3), l = [], s = o = 0, a = e.length; o < a; s = ++o)
                          t = e[s],
                          u = n > 0 ? s : i - s,
                          l.push(this.dom.setStyle(t, "animation", "delighted-web-btn-anim " + r + "s linear " + (u * r / (i - 1)).toFixed(3) + "s 1 normal both"));
                      return l
                  }
              }, i.prototype._autoSizeQuestionLabel = function() {
                  var t,
                      e,
                      n,
                      i;
                  return n = this.$root.querySelector(".delighted-web-question .delighted-web-column"), t = this.$root.querySelector(".delighted-web-label-question"), e = t.cloneNode(!0), this.dom.setStyle(e, "position", "absolute"), this.dom.setStyle(e, "white-space", "nowrap"), this.dom.setStyle(e, "opacity", "0"), t.parentNode.appendChild(e), i = e.offsetWidth, t.parentNode.removeChild(e), i < 650 ? this.dom.setStyle(n, "max-width", "none") : this.dom.clearInlineStyle(n, "max-width")
              }, i
          }(exports.DisplayStrategy)
      }.call(this),
      function() {
          var t,
              e,
              n,
              i = function(t, e) {
                  return function() {
                      return t.apply(e, arguments)
                  }
              };
          t = 0,
          e = 1,
          n = function() {
              function n() {
                  this.disengage = i(this.disengage, this),
                  this.engage = i(this.engage, this),
                  this.inferState = i(this.inferState, this),
                  this.isEngaged = !1,
                  this.originals = {}
              }
              return n.prototype.inferState = function(n) {
                  return n.config.BROWSER_SUPPORT.platform.isIos && n.windowHeight < .94 * n.availHeight ? t : e
              }, n.prototype.engage = function(t) {
                  var n;
                  if (!this.isEngaged)
                      return n = t === e ? "100px" : "101vh", this.originals.bodyHeight = document.body.style.height, this.originals.bodyOverflow = document.body.style.overflow, document.body.style.height = n, document.body.style.overflow = "hidden", this.originals.htmlHeight = document.documentElement.style.height, this.originals.htmlOverflow = document.documentElement.style.overflow, document.documentElement.style.height = n, document.documentElement.style.overflow = "hidden", this.originals.windowScrollX = scrollX, this.originals.windowScrollY = scrollY, window.scrollX = 0, window.scrollY = 0, this.isEngaged = !0
              }, n.prototype.disengage = function() {
                  if (this.isEngaged)
                      return document.body.style.height = this.originals.bodyHeight, document.body.style.overflow = this.originals.bodyOverflow, document.documentElement.style.height = this.originals.htmlHeight, document.documentElement.style.overflow = this.originals.htmlOverflow, scrollTo(this.originals.windowScrollX, this.originals.windowScrollY), this.isEngaged = !1
              }, n
          }(),
          exports.ScrollLock = new n
      }.call(this),
      function() {
          var t = function(t, e) {
                  return function() {
                      return t.apply(e, arguments)
                  }
              },
              e = function(t, e) {
                  function i() {
                      this.constructor = t
                  }
                  for (var r in e)
                      n.call(e, r) && (t[r] = e[r]);
                  return i.prototype = e.prototype, t.prototype = new i, t.__super__ = e.prototype, t
              },
              n = {}.hasOwnProperty;
          exports.DisplayStrategyTouch = function(n) {
              function i() {
                  this._optimizeCommentBoxHeight = t(this._optimizeCommentBoxHeight, this),
                  this._computeMaskHeight = t(this._computeMaskHeight, this),
                  this._inferScrollState = t(this._inferScrollState, this),
                  this._setupEventHandlers = t(this._setupEventHandlers, this),
                  this._measure = t(this._measure, this),
                  this._injectTemplate = t(this._injectTemplate, this),
                  this._hideToast = t(this._hideToast, this),
                  this._showThanks = t(this._showThanks, this),
                  this._showAdditionalQuestion = t(this._showAdditionalQuestion, this),
                  this._hideComment = t(this._hideComment, this),
                  this._showComment = t(this._showComment, this),
                  this._hideQuestion = t(this._hideQuestion, this),
                  this._showQuestion = t(this._showQuestion, this),
                  this._showSurvey = t(this._showSurvey, this),
                  this._hideSurvey = t(this._hideSurvey, this),
                  this._showToast = t(this._showToast, this),
                  this.hideModal = t(this.hideModal, this),
                  this.hide = t(this.hide, this),
                  this.show = t(this.show, this),
                  i.__super__.constructor.apply(this, arguments),
                  this.autoHideDelay = 1.5 * this.timingFactor
              }
              return e(i, n), i.prototype.show = function() {
                  return this._getTemplate(function(t) {
                      return function(e) {
                          return t._injectTemplate(e), t._measure(), t._setupEventHandlers(), t._showToast()
                      }
                  }(this))
              }, i.prototype.hide = function(t) {
                  return null == t && (t = {}), this.state = "hidden", exports.requestAnimationFrame(function(e) {
                      return function() {
                          var n;
                          return e.hideModal(), e.opts.disableScrollLock || exports.ScrollLock.disengage(), e.dom.transition(e.$survey, "transform " + e.transitionDuration + "s " + e.transitionEasing + " 0s"), e.dom.translateY(e.$survey, e.heightSurvey), e._remove(), "function" == typeof (n = e.opts).onHide ? n.onHide({
                              token: e.token,
                              source: t.source
                          }) : void 0
                      }
                  }(this))
              }, i.prototype.hideModal = function() {
                  return this._removeModal()
              }, i.prototype._showToast = function() {
                  return this.state = "toast", exports.requestAnimationFrame(function(t) {
                      return function() {
                          return t.dom.setStyle(t.$root, "visibility", "visible"), t.dom.translateY(t.$toast, t.heightToast), exports.requestAnimationFrame(function() {
                              var e;
                              return t.opts.disableShowAnimations || t.dom.transition(t.$toast, "transform " + t.transitionDuration + "s " + t.transitionEasing + " 0s"), t.dom.translateY(t.$toast, 0), t._resizeMask(t.heightToast), "function" == typeof (e = t.opts).onShow ? e.onShow({
                                  token: t.token
                              }) : void 0
                          })
                      }
                  }(this))
              }, i.prototype._hideSurvey = function(t) {
                  return window.clearTimeout(this.showSurveyTimeout), this.surveyShowing = !1, exports.requestAnimationFrame(function(e) {
                      return function() {
                          return e.dom.setStyle(e.$toast, "display", "block"), e.dom.translateY(e.$toast, 0), e.dom.transition(e.$survey, "transform " + e.transitionDuration + "s " + e.transitionEasing + " 0s"), e.dom.translateY(e.$survey, e.heightSurvey), e._resizeMask(e.heightToast), "function" == typeof t ? t() : void 0
                      }
                  }(this))
              }, i.prototype._showSurvey = function(t) {
                  return this.surveyShowing ? "function" == typeof t ? t() : void 0 : (this.surveyShowing = !0, exports.requestAnimationFrame(function(e) {
                      return function() {
                          var n;
                          return n = e._inferScrollState(), e.dom.setStyle(e.$survey, "display", "block"), e._measure(), e.dom.transition(e.$toast, "none"), e.dom.translateY(e.$toast, 0), e.dom.transition(e.$survey, "none"), e.dom.translateY(e.$survey, e.heightSurvey), exports.requestAnimationFrame(function() {
                              var i;
                              return e.dom.transition(e.$toast, "transform " + e.transitionDuration + "s " + e.transitionEasing + " 0s"), e.dom.translateY(e.$toast, e.heightToast), e.dom.transition(e.$survey, "transform " + e.transitionDuration + "s " + e.transitionEasing + " 0s"), e.dom.translateY(e.$survey, 0), e._disableMask(), i = 1e3 * e.transitionDuration, e.showSurveyTimeout = exports.utils.timeout(i, function() {
                                  return e.opts.disableScrollLock || exports.ScrollLock.engage(n), e.dom.setStyle(e.$toast, "display", "none"), "function" == typeof t ? t() : void 0
                              })
                          })
                      }
                  }(this)))
              }, i.prototype._showQuestion = function(t) {
                  return this.state = "question", exports.requestAnimationFrame(function(e) {
                      return function() {
                          return e.$surveyInner.classList.add("delighted-web-is-questioning"), e.$surveyInner.classList.remove("delighted-web-is-commenting"), e.$surveyInner.classList.remove("delighted-web-is-thanking"), e.$stepQuestion.classList.add("delighted-web-is-shown"), e.$stepComment.classList.remove("delighted-web-is-shown"), e.$stepThanks.classList.remove("delighted-web-is-shown"), e.dom.setStyle(e.$stepQuestion, "display", "flex"), e.dom.setStyle(e.$stepComment, "display", "none"), e.dom.setStyle(e.$stepThanks, "display", "none"), e.$stepQuestion.setAttribute("aria-hidden", "false"), e.$stepComment.setAttribute("aria-hidden", "true"), e.$stepAdditionalQuestion.setAttribute("aria-hidden", "true"), e.$stepThanks.setAttribute("aria-hidden", "true"), e._showSurvey(t)
                      }
                  }(this))
              }, i.prototype._hideQuestion = function() {
                  return "question" !== this.state ? void this.config.LOGGER.error("Must be in 'question' state to hide question (was '" + this.state + "').") : (this.state = "toast", this._hideSurvey(function(t) {
                      return function() {
                          return t.$surveyInner.classList.remove("delighted-web-is-questioning"), t.$surveyInner.classList.remove("delighted-web-is-commenting"), t.$surveyInner.classList.remove("delighted-web-is-thanking"), t.$stepQuestion.classList.remove("delighted-web-is-shown"), t.$stepComment.classList.remove("delighted-web-is-shown"), t.$stepThanks.classList.remove("delighted-web-is-shown"), t.dom.setStyle(t.$stepQuestion, "display", "none"), t.dom.setStyle(t.$stepComment, "display", "none"), t.dom.setStyle(t.$stepThanks, "display", "none")
                      }
                  }(this)))
              }, i.prototype._showComment = function(t) {
                  return this.state = "comment", this._setScore(t), this._optimizeCommentBoxHeight(), this.dom.setStyle(this.$stepQuestion, "display", "none"), this.dom.setStyle(this.$stepComment, "display", "block"), this.dom.setStyle(this.$stepThanks, "display", "none"), this.$stepComment.setAttribute("aria-hidden", "false"), this._measure(), this.$surveyInner.classList.remove("delighted-web-is-questioning"), this.$surveyInner.classList.add("delighted-web-is-commenting"), this.$surveyInner.classList.remove("delighted-web-is-thanking"), this.$stepComment.querySelector(".delighted-web-comment-box").focus(), this._showSurvey(this.opts.onShowComment)
              }, i.prototype._hideComment = function() {
                  return "comment" !== this.state ? void this.config.LOGGER.error("Must be in 'comment' state to hide comment (was '" + this.state + "').") : (this.state = "toast", this._hideSurvey(function(t) {
                      return function() {
                          return t.$surveyInner.classList.remove("delighted-web-is-questioning"), t.$surveyInner.classList.remove("delighted-web-is-commenting"), t.$surveyInner.classList.remove("delighted-web-is-thanking"), t.$stepQuestion.classList.remove("delighted-web-is-shown"), t.$stepComment.classList.remove("delighted-web-is-shown"), t.$stepThanks.classList.remove("delighted-web-is-shown"), t.dom.setStyle(t.$stepQuestion, "display", "none"), t.dom.setStyle(t.$stepComment, "display", "none"), t.dom.setStyle(t.$stepThanks, "display", "none")
                      }
                  }(this)))
              }, i.prototype._showAdditionalQuestion = function() {
                  return this.state = "additional_question", exports.requestAnimationFrame(function(t) {
                      return function() {
                          return t.dom.setStyle(t.$root, "display", "none"), t.dom.setStyle(t.$rootModal, "display", "block"), t.dom.setStyle(t.$rootModal, "visibility", "visible"), t.$stepQuestion.setAttribute("aria-hidden", "true"), t.$stepComment.setAttribute("aria-hidden", "true"), t.$stepAdditionalQuestion.setAttribute("aria-hidden", "false"), t.$stepThanks.setAttribute("aria-hidden", "true")
                      }
                  }(this))
              }, i.prototype._showThanks = function() {
                  return this.state = "thanks", exports.requestAnimationFrame(function(t) {
                      return function() {
                          var e,
                              n;
                          if (t.dom.setStyle(t.$root, "display", "block"), t.dom.setStyle(t.$rootModal, "display", "none"), t.dom.setStyle(t.$stepQuestion, "display", "none"), t.dom.setStyle(t.$stepComment, "display", "none"), t.dom.setStyle(t.$stepThanks, "display", "flex"), t._removeModal(), t.$surveyInner.classList.remove("delighted-web-is-commenting"), t.$surveyInner.classList.add("delighted-web-is-thanking"), t.$stepQuestion.setAttribute("aria-hidden", "true"), t.$stepComment.setAttribute("aria-hidden", "true"), t.$stepAdditionalQuestion.setAttribute("aria-hidden", "true"), t.$stepThanks.setAttribute("aria-hidden", "false"), e = t.$stepThanks.querySelector(".delighted-web-thanks"), n = e.classList.contains("delighted-web-thanks-custom"), t.dom.setStyle(e, "display", "block"), t._measure(), !n)
                              return t.dom.setOpacity(t.$surveyClose, 1), exports.requestAnimationFrame(function() {
                                  return t.dom.transition(t.$surveyClose, "opacity " + t.transitionDuration + "s " + t.transitionEasing + " 0s"), t.dom.setOpacity(t.$surveyClose, 0), exports.utils.timeout(1e3 * (t.transitionDuration + t.autoHideDelay), function() {
                                      return t.hide({
                                          source: "auto_hide"
                                      })
                                  })
                              })
                      }
                  }(this))
              }, i.prototype._hideToast = function() {
                  return this.state = "initial", exports.requestAnimationFrame(function(t) {
                      return function() {
                          return t.dom.transition(t.$toast, "transform " + t.transitionDuration + "s " + t.transitionEasing + " 0s"), t.dom.translateY(t.$toast, t.heightToast)
                      }
                  }(this))
              }, i.prototype._injectTemplate = function() {
                  return i.__super__._injectTemplate.apply(this, arguments), this.$toast = this.$root.querySelector(".delighted-web-toast"), this.$toastClose = this.$root.querySelector(".delighted-web-toast-close"), this.dom.setStyle(this.$toast, "display", "block"), this.opts.offsets.top && this.dom.setStyle(this.$surveyInner, "margin-top", this.opts.offsets.top + "px"), this.opts.offsets.top && this.dom.setStyle(this.$surveyClose, "margin-top", this.opts.offsets.top + "px"), "asc" === this.opts.mobileScoreOrdering && this.dom.reverseChildren(this.$root.querySelector(".delighted-web-question-score-numbers")), this.$root.classList.add("delighted-web-touch"), this.$rootModal.classList.add("delighted-web-touch")
              }, i.prototype._measure = function() {
                  return i.__super__._measure.apply(this, arguments), this.widthToast = this.$toast.offsetWidth, this.widthToastClose = this.$toastClose.offsetWidth, this.heightToast = this.$toast.offsetHeight
              }, i.prototype._setupEventHandlers = function() {
                  return i.__super__._setupEventHandlers.apply(this, arguments), this.dom.bindEvent(this.$toast, "click", function(t) {
                      return function(e) {
                          var n;
                          return t._measure(), e.clientX < t.widthToast - t.widthToastClose ? t._showQuestion() : (t._hideToast(), t._remove(), t._removeModal(), "function" == typeof (n = t.opts).onHide ? n.onHide({
                              token: t.token,
                              source: "toast_close"
                          }) : void 0)
                      }
                  }(this)), this.dom.bindEvent(window, "orientationchange", function(t) {
                      return function() {
                          return t._optimizeCommentBoxHeight()
                      }
                  }(this)), this.dom.bindEvent(window, "resize", this._optimizeCommentBoxHeight())
              }, i.prototype._inferScrollState = function() {
                  return exports.ScrollLock.inferState({
                      config: this.config,
                      windowHeight: this.dom.calcWindowHeight(),
                      availHeight: this.dom.calcScreenHeight()
                  })
              }, i.prototype._computeMaskHeight = function() {
                  return i.__super__._computeMaskHeight.apply(this, arguments) - 50
              }, i.prototype._optimizeCommentBoxHeight = function() {
                  var t;
                  return t = function(t) {
                      return function() {
                          var e,
                              n,
                              i,
                              r,
                              o,
                              s,
                              a,
                              u,
                              l,
                              c,
                              d,
                              h;
                          return e = 24, l = 6, d = t.dom.calcWindowHeight(), h = t.dom.calcWindowWidth(), u = 2 * e, n = 6 * e, a = 10 * e, i = t.config.BROWSER_SUPPORT.platform.isIpad, r = t.config.BROWSER_SUPPORT.platform.isIphone, o = t.config.BROWSER_SUPPORT.platform.isIpod, s = "portrait" === t.dom.detectOrientation(), c = i ? s ? Math.floor(.4 * d) : Math.floor(.2 * d) : r || o ? s ? Math.floor(.3 * d) : Math.floor(.1 * d) : n, c -= c % e, Math.min(a, Math.max(u, c)) + 2 * l
                      }
                  }(this), this.dom.setStyle(this.$stepComment.querySelector(".delighted-web-comment-box"), "height", t() + "px")
              }, i
          }(exports.DisplayStrategy)
      }.call(this),
      function() {
          var t,
              e = function(t, e) {
                  return function() {
                      return t.apply(e, arguments)
                  }
              };
          t = function() {
              function t(t) {
                  this.hide = e(this.hide, this),
                  this.logger = t.LOGGER
              }
              return t.prototype.hide = function() {
                  var t,
                      e;
                  return t = null != (e = exports.displayStrategyProxy) ? e.displayStrategy : void 0, (null != t ? t.canHide() : void 0) ? (this.logger.info("Hiding survey."), t.hide(), delighted.wasEligible = !1) : this.logger.info("A survey can only be hidden when it is visible and the person has not responded. Current state: " + t.state)
              }, t
          }(),
          exports.Survey = t
      }.call(this),
      function() {
          var t,
              e = function(t, e) {
                  return function() {
                      return t.apply(e, arguments)
                  }
              };
          t = function() {
              function t(t) {
                  this.updateSurveyTemplate = e(this.updateSurveyTemplate, this),
                  this.toggleStateForPreview = e(this.toggleStateForPreview, this),
                  this.displayStrategy = t
              }
              return t.prototype.toggleStateForPreview = function(t, e, n) {
                  return null == n && (n = {}), this.displayStrategy.toggleStateForPreview(t, e, n)
              }, t.prototype.updateSurveyTemplate = function(t) {
                  return this.displayStrategy.config.SURVEY_TEMPLATE = t
              }, t
          }(),
          exports.displayStrategyProxy = null,
          exports.showSurvey = function(e, n, i) {
              var r,
                  o,
                  s,
                  a,
                  u,
                  l,
                  c;
              return e.LOGGER.info("Survey showing."), c = function(t, n) {
                  var i;
                  return i = exports.clone(n || {}), e.PREVIEW_MODE && (i.displayStrategy = exports.displayStrategyProxy), "function" == typeof t ? t(i) : void 0
              }, u = function(t) {
                  var n;
                  return e.LOGGER.info("Survey shown."), e.STATE_MANAGER.getLastSurveyedToken() !== t.token && e.STATE_MANAGER.setLastSurveyedTimestamp(exports.utils.getCurrentTimestamp(), {
                      token: t.token
                  }), e.TELEMETRY.instrument("SURVEY_SHOWN"), n = new exports.Survey(e), c(i.onShow, {
                      survey: n
                  })
              }, l = function() {
                  return e.LOGGER.debug("Survey shown comment."), e.TELEMETRY.instrument("SURVEY_SHOWN_COMMENT"), c(i.onShowComment)
              }, a = function(t) {
                  return e.LOGGER.debug("Survey responded."), e.STATE_MANAGER.setLastRespondedTimestamp(exports.utils.getCurrentTimestamp(), {
                      token: t.token
                  }), e.TELEMETRY.instrument("SURVEY_RESPONDED", {
                      score: t.score
                  }), c(i.onRespond, {
                      score: t.score
                  })
              }, o = function() {
                  return e.LOGGER.debug("Survey commented."), e.TELEMETRY.instrument("SURVEY_COMMENTED"), c(i.onComment)
              }, r = function(t) {
                  return e.LOGGER.debug("Survey additional question answered."), e.TELEMETRY.instrument("SURVEY_AQ_ANSWERED", {
                      question_id: t.question_id,
                      answer: t.answer
                  }), c(i.onAqAnswer)
              }, s = function(t) {
                  return e.LOGGER.info("Survey hidden."), "toast_close" !== t.source && "close" !== t.source && "close_additional_questions" !== t.source || e.STATE_MANAGER.setLastRespondedTimestamp(exports.utils.getCurrentTimestamp(), {
                      token: t.token
                  }), e.TELEMETRY.instrument("SURVEY_HIDDEN", {
                      source: t.source
                  }), e.TELEMETRY.flush(), c(i.onHide)
              }, exports.domready(function() {
                  var c,
                      d,
                      h;
                  return d = {
                      params: n,
                      onShow: u,
                      onShowComment: l,
                      onRespond: a,
                      onComment: o,
                      onAqAnswer: r,
                      onHide: s,
                      buttonAnimationDirection: i.buttonAnimationDirection,
                      disableShowAnimations: i.disableShowAnimations,
                      disableShowCommentAnimations: i.disableShowCommentAnimations,
                      disableScrollLock: i.disableScrollLock,
                      offsets: i.offsets,
                      mobileScoreOrdering: i.mobileScoreOrdering,
                      darkBackground: i.darkBackground
                  }, h = "touch" === e.FORCE_DISPLAY_STRATEGY || e.BROWSER_SUPPORT.platform.isTouch, c = h ? new exports.DisplayStrategyTouch(e, d) : new exports.DisplayStrategyDesktop(e, d), exports.displayStrategyProxy = new t(c), c.show()
              })
          }
      }.call(this),
      function(t, e) {
          var n = t.parse,
              i = [1, 4, 5, 6, 7, 10, 11],
              r = function(r) {
                  var o,
                      s,
                      a = 0;
                  if (s = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(r)) {
                      for (var u, l = 0; u = i[l]; ++l)
                          s[u] = +s[u] || 0;
                      s[2] = (+s[2] || 1) - 1,
                      s[3] = +s[3] || 1,
                      "Z" !== s[8] && s[9] !== e && (a = 60 * s[10] + s[11], "+" === s[9] && (a = 0 - a)),
                      o = t.UTC(s[1], s[2], s[3], s[4], s[5] + a, s[6], s[7])
                  } else
                      o = n ? n(r) : NaN;
                  return o
              };
          exports.iso8601 = {
              parse: r
          }
      }(Date),
      function() {
          exports.generateProperties = function(t, e, n) {
              var i,
                  r,
                  o,
                  s,
                  a,
                  u,
                  l;
              return u = exports.clone(e.properties || {}), i = function(e) {
                  var n,
                      i;
                  return i = e.timeSinceFirstSeen, n = i > 1e3 * t.RETURN_DELAY, t.LOGGER.debug("Returning visitor:", n, "(~" + i + " ms since first seen)"), n
              }, l = t.PREFIX_PROPERTIES ? "Delighted " : "", null == u[r = l + "Page"] && (u[r] = document.title), null == u[o = l + "Page URL"] && (u[o] = location.href), null == u[s = l + "Referrer URL"] && (u[s] = document.referrer), i(n) && null == u[a = l + "Visitor Type"] && (u[a] = "Returning"), u._delighted_user_agent = navigator.userAgent, t.IS_TEST && (u._delighted_test = "1"), n.token && (u._delighted_survey_request_token = n.token), u
          }
      }.call(this),
      function() {
          exports.checkSurveyEligibility = function(t, e) {
              var n,
                  i,
                  r,
                  o,
                  s,
                  a,
                  u,
                  l,
                  c,
                  d,
                  h,
                  p,
                  f,
                  m,
                  g,
                  y,
                  v,
                  _,
                  b,
                  w;
              return t.TELEMETRY.instrument("CHECKING_ELIGIBILITY"), i = window[t.NAME], n = exports.utils.getCurrentTimestamp(), s = function(t, e) {
                  var n,
                      i;
                  return n = null != t.createdAt && exports.iso8601.parse(t.createdAt), i = "number" == typeof n && !isNaN(n), i ? Math.min(n, e) : e
              }, o = function(e, n) {
                  var i,
                      r,
                      o,
                      s;
                  o = exports.generateProperties(t, e, n),
                  r = {};
                  for (i in o)
                      s = o[i],
                      r[i] = s;
                  return e.email && (r.email = e.email), e.name && (r.name = e.name), r
              }, b = function(t) {
                  return Math.random() <= t.sampleFactor
              }, a = 1e3 * e.initialDelay, v = e.recurringPeriod ? 1e3 * e.recurringPeriod : t.NEVER_FUTURE_TIMESTAMP, h = 1e3 * e.minSurveyInterval, p = 1e3 * e.minTimeForDisplay, r = t.STATE_MANAGER.getSetFirstSeenTimestamp(n), u = s(e, r), c = t.STATE_MANAGER.getLastSurveyedTimestamp() || t.NEVER_PAST_TIMESTAMP, d = t.STATE_MANAGER.getLastSurveyedToken(), l = t.STATE_MANAGER.getLastRespondedTimestamp() || t.NEVER_PAST_TIMESTAMP, w = n - r, g = e.forceDisplay ? n : (f = Math.max(c, u), m = c > t.NEVER_PAST_TIMESTAMP ? v : a,
              f + m), g = Math.max(g, c + h), t.TELEMETRY.instrument("ELIGIBILITY_TIMESTAMPS", {
                  firstSeenTimestamp: r,
                  initialTimestamp: u,
                  lastSurveyTimestamp: c,
                  nextSurveyTimestamp: g
              }), _ = i.wasEligible ? {
                  isEligible: !1,
                  reason: "person has already been surveyed during this session"
              } : "m5KZudle4UrncwrN" === t.WRITE_KEY && !e.disableScrollLock && /file/.test(location.protocol) ? {
                  isEligible: !1,
                  reason: "configuration is unsupported"
              } : t.IS_TEST ? {
                  isEligible: !0,
                  reason: "test mode is enabled",
                  params: o(e, {
                      timeSinceFirstSeen: w
                  }),
                  delay: 0
              } : n - c < p && l < c && d ? {
                  isEligible: !0,
                  isRedisplay: !0,
                  reason: "person has an active survey (valid for another " + Math.round(Math.max(0, p - n + c) / 1e3) + " seconds)",
                  params: o(e, {
                      timeSinceFirstSeen: w,
                      token: d
                  }),
                  delay: 0
              } : g <= n ? b(e) ? t.PLAN_LIMIT_EXHAUSTED ? {
                  isEligible: !1,
                  reason: "although person is eligible, and was sampled (rate: " + 100 * e.sampleFactor + "%), plan survey limit is exhausted",
                  exhausted: !0
              } : {
                  isEligible: !0,
                  reason: "person is eligible, and was sampled (rate: " + 100 * e.sampleFactor + "%)",
                  params: o(e, {
                      timeSinceFirstSeen: w
                  }),
                  delay: 1e3 * e.minTimeOnPage
              } : {
                  isEligible: !1,
                  reason: "although person is eligible, they were not sampled (rate: " + 100 * e.sampleFactor + "%)"
              } : (y = g >= t.NEVER_FUTURE_TIMESTAMP ? "person has already been surveyed and recurring surveys are not configured" : "person is not eligible until " + new Date(g), {
                  isEligible: !1,
                  reason: y
              }), _.isEligible && (i.wasEligible = !0), _
          }
      }.call(this),
      function() {
          var t = new RegExp("bot|crawl|spider|borg|yahoo|slurp|archiver|netresearch|lycos|scooter  |altavista|teoma|oegp|charlotte|http client|htdig|ichiro|mogimogi|larbin|pompos|scrubby  |searchsight|semanticdiscovery|snappy|speedy|voila|vortex|voyager|zao|zeal|dataparksearch  |findlinks|yottaamonitor|browsermob|httpmonitor|bingpreview|pagepeeker|webthumb|url2png|zooshot  |gomeza|google sketchup|read later|pingdom|facebook|rackspace|scan|link|ezine|preview  |dig|tarantula|urllib|jakarta|wget|rget|monitor|libwww|moozilla|seer|spice|snoopy|feedfetcher  |google wireless transcoder|curl|wordpress|java|netfront|archive|xenu|feed|appmanager|covario  |perl|host|lwp|page speed|ptst|digext|nutch|sleuth|yottaamonitor", "i");
          exports.isBot = function(e) {
              return t.test(e)
          }
      }(),
      function(t, e, n) {
          function i(t, e) {
              return typeof t === e
          }
          function r() {
              var t,
                  e,
                  n,
                  r,
                  o,
                  s,
                  a;
              for (var u in b)
                  if (b.hasOwnProperty(u)) {
                      if (t = [], e = b[u], e.name && (t.push(e.name.toLowerCase()), e.options && e.options.aliases && e.options.aliases.length))
                          for (n = 0; n < e.options.aliases.length; n++)
                              t.push(e.options.aliases[n].toLowerCase());
                      for (r = i(e.fn, "function") ? e.fn() : e.fn, o = 0; o < t.length; o++)
                          s = t[o],
                          a = s.split("."),
                          1 === a.length ? x[a[0]] = r : (!x[a[0]] || x[a[0]] instanceof Boolean || (x[a[0]] = new Boolean(x[a[0]])), x[a[0]][a[1]] = r),
                          _.push((r ? "" : "no-") + a.join("-"))
                  }
          }
          function o(t) {
              var e = k.className,
                  n = x._config.classPrefix || "";
              if (S && (e = e.baseVal), x._config.enableJSClass) {
                  var i = new RegExp("(^|\\s)" + n + "no-js(\\s|$)");
                  e = e.replace(i, "$1" + n + "js$2")
              }
              x._config.enableClasses && (e += " " + n + t.join(" " + n), S ? k.className.baseVal = e : k.className = e)
          }
          function s() {
              return "function" != typeof e.createElement ? e.createElement(arguments[0]) : S ? e.createElementNS.call(e, "http://www.w3.org/2000/svg", arguments[0]) : e.createElement.apply(e, arguments)
          }
          function a() {
              var t = e.body;
              return t || (t = s(S ? "svg" : "body"), t.fake = !0), t
          }
          function u(t, n, i, r) {
              var o,
                  u,
                  l,
                  c,
                  d = "modernizr",
                  h = s("div"),
                  p = a();
              if (parseInt(i, 10))
                  for (; i--;)
                      l = s("div"),
                      l.id = r ? r[i] : d + (i + 1),
                      h.appendChild(l);
              return o = s("style"), o.type = "text/css", o.id = "s" + d, (p.fake ? p : h).appendChild(o), p.appendChild(h), o.styleSheet ? o.styleSheet.cssText = t : o.appendChild(e.createTextNode(t)), h.id = d, p.fake && (p.style.background = "", p.style.overflow = "hidden", c = k.style.overflow, k.style.overflow = "hidden", k.appendChild(p)), u = n(h, t), p.fake ? (p.parentNode.removeChild(p), k.style.overflow = c, k.offsetHeight) : h.parentNode.removeChild(h), !!u
          }
          function l(t, e) {
              return !!~("" + t).indexOf(e)
          }
          function c(t) {
              return t.replace(/([a-z])-([a-z])/g, function(t, e, n) {
                  return e + n.toUpperCase()
              }).replace(/^-/, "")
          }
          function d(t, e) {
              return function() {
                  return t.apply(e, arguments)
              }
          }
          function h(t, e, n) {
              var r;
              for (var o in t)
                  if (t[o] in e)
                      return n === !1 ? t[o] : (r = e[t[o]], i(r, "function") ? d(r, n || e) : r);
              return !1
          }
          function p(t) {
              return t.replace(/([A-Z])/g, function(t, e) {
                  return "-" + e.toLowerCase()
              }).replace(/^ms-/, "-ms-")
          }
          function f(e, n, i) {
              var r;
              if ("getComputedStyle" in t) {
                  r = getComputedStyle.call(t, e, n);
                  var o = t.console;
                  if (null !== r)
                      i && (r = r.getPropertyValue(i));
                  else if (o) {
                      var s = o.error ? "error" : "log";
                      o[s].call(o, "getComputedStyle returning null, its possible modernizr test results are inaccurate")
                  }
              } else
                  r = !n && e.currentStyle && e.currentStyle[i];
              return r
          }
          function m(e, i) {
              var r = e.length;
              if ("CSS" in t && "supports" in t.CSS) {
                  for (; r--;)
                      if (t.CSS.supports(p(e[r]), i))
                          return !0;
                  return !1
              }
              if ("CSSSupportsRule" in t) {
                  for (var o = []; r--;)
                      o.push("(" + p(e[r]) + ":" + i + ")");
                  return o = o.join(" or "), u("@supports (" + o + ") { #modernizr { position: absolute; } }", function(t) {
                      return "absolute" == f(t, null, "position")
                  })
              }
              return n
          }
          function g(t, e, r, o) {
              function a() {
                  d && (delete O.style, delete O.modElem)
              }
              if (o = !i(o, "undefined") && o, !i(r, "undefined")) {
                  var u = m(t, r);
                  if (!i(u, "undefined"))
                      return u
              }
              for (var d, h, p, f, g, y = ["modernizr", "tspan", "samp"]; !O.style && y.length;)
                  d = !0,
                  O.modElem = s(y.shift()),
                  O.style = O.modElem.style;
              for (p = t.length, h = 0; h < p; h++)
                  if (f = t[h], g = O.style[f], l(f, "-") && (f = c(f)), O.style[f] !== n) {
                      if (o || i(r, "undefined"))
                          return a(), "pfx" != e || f;
                      try {
                          O.style[f] = r
                      } catch (t) {}
                      if (O.style[f] != g)
                          return a(), "pfx" != e || f
                  }
              return a(), !1
          }
          function y(t, e, n, r, o) {
              var s = t.charAt(0).toUpperCase() + t.slice(1),
                  a = (t + " " + A.join(s + " ") + s).split(" ");
              return i(e, "string") || i(e, "undefined") ? g(a, e, r, o) : (a = (t + " " + N.join(s + " ") + s).split(" "), h(a, e, n))
          }
          function v(t, e, i) {
              return y(t, n, n, e, i)
          }
          var _ = [],
              b = [],
              w = {
                  _version: "3.6.0",
                  _config: {
                      classPrefix: "",
                      enableClasses: !0,
                      enableJSClass: !0,
                      usePrefixes: !0
                  },
                  _q: [],
                  on: function(t, e) {
                      var n = this;
                      setTimeout(function() {
                          e(n[t])
                      }, 0)
                  },
                  addTest: function(t, e, n) {
                      b.push({
                          name: t,
                          fn: e,
                          options: n
                      })
                  },
                  addAsyncTest: function(t) {
                      b.push({
                          name: null,
                          fn: t
                      })
                  }
              },
              x = function() {};
          x.prototype = w,
          x = new x,
          x.addTest("cookies", function() {
              try {
                  e.cookie = "cookietest=1";
                  var t = e.cookie.indexOf("cookietest=") != -1;
                  return e.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT", t
              } catch (t) {
                  return !1
              }
          }),
          x.addTest("cors", "XMLHttpRequest" in t && "withCredentials" in new XMLHttpRequest),
          x.addTest("json", "JSON" in t && "parse" in JSON && "stringify" in JSON),
          x.addTest("queryselector", "querySelector" in e && "querySelectorAll" in e);
          var T = !1;
          try {
              T = "WebSocket" in t && 2 === t.WebSocket.CLOSING
          } catch (t) {}
          x.addTest("websockets", T);
          var k = e.documentElement,
              S = "svg" === k.nodeName.toLowerCase(),
              C = function() {
                  function t(t, e) {
                      var r;
                      return !!t && (e && "string" != typeof e || (e = s(e || "div")), t = "on" + t, r = t in e, !r && i && (e.setAttribute || (e = s("div")), e.setAttribute(t, ""), r = "function" == typeof e[t], e[t] !== n && (e[t] = n), e.removeAttribute(t)), r)
                  }
                  var i = !("onblur" in e.documentElement);
                  return t
              }();
          w.hasEvent = C;
          var M = w._config.usePrefixes ? " -webkit- -moz- -o- -ms- ".split(" ") : ["", ""];
          w._prefixes = M;
          var E = "CSS" in t && "supports" in t.CSS,
              L = "supportsCSS" in t;
          x.addTest("supports", E || L);
          var D = w.testStyles = u;
          x.addTest("touchevents", function() {
              var n;
              if ("ontouchstart" in t || t.DocumentTouch && e instanceof DocumentTouch)
                  n = !0;
              else {
                  var i = ["@media (", M.join("touch-enabled),("), "heartz", ")", "{#modernizr{top:9px;position:absolute}}"].join("");
                  D(i, function(t) {
                      n = 9 === t.offsetTop
                  })
              }
              return n
          });
          var P = "Moz O ms Webkit",
              A = w._config.usePrefixes ? P.split(" ") : [];
          w._cssomPrefixes = A;
          var N = w._config.usePrefixes ? P.toLowerCase().split(" ") : [];
          w._domPrefixes = N;
          var j = {
              elem: s("modernizr")
          };
          x._q.push(function() {
              delete j.elem
          });
          var O = {
              style: j.elem.style
          };
          x._q.unshift(function() {
              delete O.style
          }),
          w.testAllProps = y,
          w.testAllProps = v,
          x.addTest("cssanimations", v("animationName", "a", !0)),
          x.addTest("csstransforms3d", function() {
              return !!v("perspective", "1px", !0)
          }),
          x.addTest("csstransitions", v("transition", "all", !0)),
          r(),
          o(_),
          delete w.addTest,
          delete w.addAsyncTest;
          for (var Y = 0; Y < x._q.length; Y++)
              x._q[Y]();
          exports.Modernizr = x
      }(window, document),
      function() {
          exports.detectBrowserSupport = function() {
              var t,
                  e,
                  n,
                  i,
                  r,
                  o;
              return t = document.createElement("div"), e = document.createElement("textarea"), o = navigator.userAgent, i = /PhantomJS/.test(window.navigator.userAgent), n = {
                  cookies: exports.Modernizr.cookies,
                  animation: exports.Modernizr.cssanimations,
                  transition: exports.Modernizr.csstransitions,
                  transform: exports.Modernizr.csstransforms3d,
                  getComputedStyle: !!("getComputedStyle" in window),
                  cors: exports.Modernizr.cors,
                  json: exports.Modernizr.json,
                  webSocket: exports.Modernizr.websockets,
                  inputEvent: exports.Modernizr.hasEvent("input"),
                  querySelector: exports.Modernizr.queryselector,
                  styleRemoveProperty: !!("removeProperty" in t.style)
              }, r = {
                  isBot: exports.isBot(o),
                  isTouch: exports.Modernizr.touchevents && !i,
                  isIos: /(iPad|iPod|iPhone)/.test(o),
                  isIpad: /iPad/.test(o),
                  isIpod: /iPod/.test(o),
                  isIphone: /iPhone/.test(o)
              }, {
                  features: n,
                  platform: r
              }
          }
      }.call(this),
      function() {
          var t = function(t, e) {
              return function() {
                  return t.apply(e, arguments)
              }
          };
          exports.Telemetry = function() {
              function e(e) {
                  this._addEventListeners = t(this._addEventListeners, this),
                  this.flush = t(this.flush, this),
                  this.instrument = t(this.instrument, this),
                  this.config = e,
                  this.dom = new exports.DomHelpers(e),
                  this.dataSetId = Math.random().toString(16).substring(2),
                  this.data = {
                      dataSetId: this.dataSetId,
                      telemetryVersion: n,
                      events: []
                  },
                  this._addEventListeners(),
                  this.config.LOGGER.debug("Telemetry init.")
              }
              var n;
              return n = 2, e.prototype.instrument = function(t, e) {
                  var n;
                  return null == e && (e = {}), n = exports.clone(e), n.name = t, n.timestamp = (new Date).getTime(), n.treatments = this.config.EXPERIMENTS.treatments, this.data.events.push(n), "SURVEY_SHOWN" === t && (this.shouldAutoFlushOnWindowUnload = !0), this.config.LOGGER.debug("Telemetry instrument:", t, n)
              }, e.prototype.flush = function() {
                  if (this.config.TELEMETRY_URL && this.data.events.length > 0)
                      return this.config.LOGGER.debug("Telemetry flush:", this.data), exports.utils.ajaxSimpleCors({
                          method: "POST",
                          url: this.config.TELEMETRY_URL,
                          body: {
                              data: this.data
                          },
                          withCredentials: /^staging/.test(this.config.ENV),
                          callback: function(t) {
                              return function() {
                                  return t.config.LOGGER.debug("Telemetry flushed.")
                              }
                          }(this)
                      })
              }, e.prototype._addEventListeners = function() {
                  return this.dom.bindEvent(window, "beforeunload", function(t) {
                      return function() {
                          t.instrument("WINDOW_BEFORE_UNLOAD"),
                          t.shouldAutoFlushOnWindowUnload && t.flush()
                      }
                  }(this))
              }, e
          }()
      }.call(this),
      function() {
          var t,
              e = function(t, e) {
                  return function() {
                      return t.apply(e, arguments)
                  }
              };
          t = function() {
              function t(t) {
                  this._changeState = e(this._changeState, this),
                  this._setState = e(this._setState, this),
                  this._getState = e(this._getState, this),
                  this._deserializeTimestampCookieValue = e(this._deserializeTimestampCookieValue, this),
                  this._serializeTimestampCookieValue = e(this._serializeTimestampCookieValue, this),
                  this._toShortName = e(this._toShortName, this),
                  this._writeTimestampCookie = e(this._writeTimestampCookie, this),
                  this._readTimestampCookie = e(this._readTimestampCookie, this),
                  this.setSavedAnswer = e(this.setSavedAnswer, this),
                  this.getSavedAnswer = e(this.getSavedAnswer, this),
                  this.reset = e(this.reset, this),
                  this.setLastRespondedTimestamp = e(this.setLastRespondedTimestamp, this),
                  this.getLastRespondedTimestamp = e(this.getLastRespondedTimestamp, this),
                  this.setLastSurveyedTimestamp = e(this.setLastSurveyedTimestamp, this),
                  this.getLastSurveyedToken = e(this.getLastSurveyedToken, this),
                  this.getLastSurveyedTimestamp = e(this.getLastSurveyedTimestamp, this),
                  this.getSetFirstSeenTimestamp = e(this.getSetFirstSeenTimestamp, this),
                  this.setFirstSeenTimestamp = e(this.setFirstSeenTimestamp, this),
                  this.getFirstSeenTimestamp = e(this.getFirstSeenTimestamp, this),
                  this.config = t
              }
              var n;
              return n = {
                  delighted_fst: "fst",
                  delighted_lst: "lst",
                  delighted_lrt: "lrt",
                  saved_answers: "sa"
              }, t.prototype.getFirstSeenTimestamp = function() {
                  var t;
                  return t = this._readTimestampCookie(this.config.COOKIE_FIRST_SEEN_TIMESTAMP), null != t ? t.timestamp : void 0
              }, t.prototype.setFirstSeenTimestamp = function(t, e) {
                  return this._writeTimestampCookie({
                      name: this.config.COOKIE_FIRST_SEEN_TIMESTAMP,
                      timestamp: t,
                      metadata: e,
                      expires: this.config.COOKIE_FIRST_SEEN_TIMESTAMP_EXPIRY_DAYS
                  }), t
              }, t.prototype.getSetFirstSeenTimestamp = function(t, e) {
                  return this.getFirstSeenTimestamp() || this.setFirstSeenTimestamp(t, e)
              }, t.prototype.getLastSurveyedTimestamp = function() {
                  var t;
                  return t = this._readTimestampCookie(this.config.COOKIE_LAST_SURVEYED_TIMESTAMP), null != t ? t.timestamp : void 0
              }, t.prototype.getLastSurveyedToken = function() {
                  var t;
                  return t = this._readTimestampCookie(this.config.COOKIE_LAST_SURVEYED_TIMESTAMP), null != t ? t.metadata.token : void 0
              }, t.prototype.setLastSurveyedTimestamp = function(t, e) {
                  return this._writeTimestampCookie({
                      name: this.config.COOKIE_LAST_SURVEYED_TIMESTAMP,
                      timestamp: t,
                      metadata: e,
                      expires: this.config.COOKIE_LAST_SURVEYED_TIMESTAMP_EXPIRY_DAYS
                  }), t
              }, t.prototype.getLastRespondedTimestamp = function() {
                  var t;
                  return t = this._readTimestampCookie(this.config.COOKIE_LAST_RESPONDED_TIMESTAMP), null != t ? t.timestamp : void 0
              }, t.prototype.setLastRespondedTimestamp = function(t, e) {
                  return this._writeTimestampCookie({
                      name: this.config.COOKIE_LAST_RESPONDED_TIMESTAMP,
                      timestamp: t,
                      metadata: e,
                      expires: this.config.COOKIE_LAST_RESPONDED_TIMESTAMP_EXPIRY_DAYS
                  }), t
              }, t.prototype.reset = function() {
                  return exports.Cookies.remove(this.config.COOKIE_NAME, {
                      domain: this.config.COOKIE_DOMAIN
                  }), exports.Cookies.remove(this.config.COOKIE_FIRST_SEEN_TIMESTAMP, {
                      domain: this.config.COOKIE_DOMAIN
                  }), exports.Cookies.remove(this.config.COOKIE_LAST_SURVEYED_TIMESTAMP, {
                      domain: this.config.COOKIE_DOMAIN
                  }), exports.Cookies.remove(this.config.COOKIE_LAST_RESPONDED_TIMESTAMP, {
                      domain: this.config.COOKIE_DOMAIN
                  })
              }, t.prototype.getSavedAnswer = function(t) {
                  var e,
                      n;
                  return n = this._getState(), e = n[this.config.SURVEY_CONTEXT_ID] || {}, e = n[this.config.SURVEY_CONTEXT_ID][this._toShortName("saved_answers")] || {}, e[t]
              }, t.prototype.setSavedAnswer = function(t, e) {
                  return this._changeState(function(n) {
                      return function(i) {
                          var r,
                              o,
                              s;
                          return r = i[o = n.config.SURVEY_CONTEXT_ID] || (i[o] = {}), r = r[s = n._toShortName("saved_answers")] || (r[s] = {}), r[t] = e
                      }
                  }(this))
              }, t.prototype._readTimestampCookie = function(t) {
                  var e,
                      n,
                      i,
                      r;
                  if (this.config.SURVEY_CONTEXT_ID) {
                      if (i = this._getState(), i[n = this.config.SURVEY_CONTEXT_ID] || (i[n] = {}), e = i[this.config.SURVEY_CONTEXT_ID], r = e[this._toShortName(t)])
                          return {
                              timestamp: new Date(parseInt(r.t, 10)).getTime(),
                              metadata: r.m
                          }
                  } else if (r = exports.Cookies.get(t), null != r)
                      return this._deserializeTimestampCookieValue(r)
              }, t.prototype._writeTimestampCookie = function(t) {
                  var e;
                  return this.config.SURVEY_CONTEXT_ID ? this._changeState(function(e) {
                      return function(n) {
                          var i,
                              r;
                          return i = n[r = e.config.SURVEY_CONTEXT_ID] || (n[r] = {}), i[e._toShortName(t.name)] = {
                              t: t.timestamp.toString(),
                              m: t.metadata
                          }
                      }
                  }(this)) : (e = this._serializeTimestampCookieValue(t.timestamp, t.metadata), exports.Cookies.set(t.name, e, {
                      expires: t.expires,
                      domain: this.config.COOKIE_DOMAIN,
                      samesite: "lax"
                  }))
              }, t.prototype._toShortName = function(t) {
                  return n[t] || t
              }, t.prototype._serializeTimestampCookieValue = function(t, e) {
                  return [t.toString(), JSON.stringify(e || {})].join(":")
              }, t.prototype._deserializeTimestampCookieValue = function(t) {
                  var e,
                      n,
                      i;
                  return n = t.split(":"), i = n.shift(), e = n.join(":") || "{}", {
                      timestamp: new Date(parseInt(i, 10)).getTime(),
                      metadata: JSON.parse(e)
                  }
              }, t.prototype._getState = function() {
                  var t,
                      e,
                      n,
                      i,
                      r,
                      o,
                      s,
                      a;
                  if (n = exports.Cookies.get(this.config.COOKIE_NAME), !exports.utils.isBlank(n))
                      return JSON.parse(n);
                  for (s = {}, t = s[this.config.SURVEY_CONTEXT_ID] = {}, o = [this.config.COOKIE_FIRST_SEEN_TIMESTAMP, this.config.COOKIE_LAST_SURVEYED_TIMESTAMP, this.config.COOKIE_LAST_RESPONDED_TIMESTAMP], i = 0, r = o.length; i < r; i++)
                      e = o[i],
                      n = exports.Cookies.get(e),
                      n && (a = this._deserializeTimestampCookieValue(n), t[this._toShortName(e)] = {
                          t: a.timestamp.toString(),
                          m: a.metadata
                      }),
                      exports.Cookies.remove(e, {
                          domain: this.config.COOKIE_DOMAIN
                      });
                  return this._setState(s)
              }, t.prototype._setState = function(t) {
                  return exports.Cookies.set(this.config.COOKIE_NAME, JSON.stringify(t), {
                      expires: this.config.COOKIE_EXPIRY_DAYS,
                      domain: this.config.COOKIE_DOMAIN,
                      samesite: "lax"
                  }), t
              }, t.prototype._changeState = function(t) {
                  var e;
                  return e = this._getState(), t(e), this._setState(e)
              }, t
          }(),
          exports.StateManager = t
      }.call(this),
      function() {
          var t;
          t = function() {
              function t(t, e) {
                  null == e && (e = {}),
                  this.config = t,
                  this.treatments = e.treatments || {}
              }
              return t
          }(),
          exports.Experiments = t
      }.call(this),
      function() {
          exports.loadDelightedLibrary = function(t) {
              var e,
                  n,
                  i,
                  r,
                  o,
                  s,
                  a,
                  u,
                  l,
                  c,
                  d;
              if (d = window._delighted, d || (d = window._delighted = {}), n = window[t.NAME], !n.isInitialized) {
                  if (n.isInitialized = !0, u = exports.qs.parse(location.search.substring(1)), t.IS_TEST = n.isTest || /test/.test(u.delighted) || new RegExp(t.COOKIE_IS_TEST + "=1").test(document.cookie), t.IS_DEBUG = n.isDebug || /debug/.test(u.delighted) || new RegExp(t.COOKIE_IS_DEBUG + "=1").test(document.cookie), /touch/.test(u.delighted) && (t.FORCE_DISPLAY_STRATEGY = "touch"), t.COOKIE_DOMAIN = "." + exports.topdomain(location.href), "." === t.COOKIE_DOMAIN && (t.COOKIE_DOMAIN = null), a = n.logLevel || t.LOG_LEVEL || (t.IS_DEBUG ? "debug" : "info"), t.LOGGER = exports.utils.buildLogger("[Delighted]", a), t.LOGGER.debug("Configuration:", t), !t.IS_TEST && !t.ACTIVE)
                      return void t.LOGGER.warn('Currently turned off. To turn it on, sign in to Delighted, go to Survey people > Web and click "Turn on". If you turned it on recently, you may need to wait a few minutes.');
                  if (t.BROWSER_SUPPORT = exports.detectBrowserSupport(), t.LOGGER.debug("Browser support:", t.BROWSER_SUPPORT), o = !t.BROWSER_SUPPORT.platform.isBot && t.BROWSER_SUPPORT.features.querySelector && t.BROWSER_SUPPORT.features.styleRemoveProperty && t.BROWSER_SUPPORT.features.json && t.BROWSER_SUPPORT.features.cors && t.BROWSER_SUPPORT.features.inputEvent && t.BROWSER_SUPPORT.features.cookies, t.EXPERIMENTS = new exports.Experiments(t, {
                      treatments: exports.clone(t.OVERRIDE_EXPERIMENT_TREATMENTS || {})
                  }), t.TELEMETRY = new exports.Telemetry(t), t.TELEMETRY.instrument("TELEMETRY_INIT", {
                      browserSupport: t.BROWSER_SUPPORT,
                      cookieDomain: t.COOKIE_DOMAIN,
                      isTest: t.IS_TEST,
                      isDebug: t.IS_DEBUG,
                      logLevel: a
                  }), !o)
                      return void t.LOGGER.warn("Unsupported browser.");
                  if (!t.IS_TEST && !t.ENABLE_TOUCH_PLATFORMS && t.BROWSER_SUPPORT.platform.isTouch)
                      return void t.LOGGER.warn("Touch platforms not enabled.");
                  for (t.STATE_MANAGER = new exports.StateManager(t), n.survey = function(e) {
                      var n;
                      console.log("---------1---------");
                      console.log(t);
                      console.log("---------2---------");
                      return t.LOGGER.debug("Survey called."), t.TELEMETRY.instrument("SURVEY_CALLED"), d.activeSurveyContextId ? void (d.activeSurveyContextId === t.SURVEY_CONTEXT_ID ? t.LOGGER.info("Survey not shown because it's already active.") : t.LOGGER.info("Survey not shown because there's another active survey (" + d.activeSurveyContextId + ")")) : (d.activeSurveyContextId = t.SURVEY_CONTEXT_ID, e = exports.clone(e || {}), null == e.initialDelay && (e.initialDelay = t.DEFAULT_INITIAL_DELAY), null == e.recurringPeriod && (e.recurringPeriod = t.DEFAULT_RECURRING_PERIOD), null == e.forceDisplay && (e.forceDisplay = t.DEFAULT_FORCE_DISPLAY), null == e.minTimeOnPage && (e.minTimeOnPage = t.DEFAULT_MIN_TIME_ON_PAGE), null == e.minTimeForDisplay && (e.minTimeForDisplay = t.DEFAULT_MIN_TIME_FOR_DISPLAY), null == e.minSurveyInterval && (e.minSurveyInterval = t.DEFAULT_MIN_SURVEY_INTERVAL), null == e.sampleFactor && (e.sampleFactor = t.DEFAULT_SAMPLE_FACTOR), null == e.buttonAnimationDirection && (e.buttonAnimationDirection = "stars_five" === t.DEFAULT_SURVEY_TYPE.id ? 1 : -1), null == e.disableShowAnimations && (e.disableShowAnimations = !1), null == e.disableShowCommentAnimations && (e.disableShowCommentAnimations = !1), null == e.disableScrollLock && (e.disableScrollLock = !1), null == e.offsets && (e.offsets = {}), "m5KZudle4UrncwrN" === t.WRITE_KEY && /file/.test(location.protocol) && (e.initialDelay = t.DEFAULT_INITIAL_DELAY, e.forceDisplay = t.DEFAULT_FORCE_DISPLAY, e.minTimeOnPage = 60), n = exports.checkSurveyEligibility(t, e), t.LOGGER.debug("Survey options:", e), t.LOGGER.debug("Survey eligibility:", n), t.TELEMETRY.instrument("ELIGIBILITY_RESULT", {
                          inputOpts: e,
                          eligibility: n
                      }), n.isEligible ? (t.LOGGER.info("Survey will show because " + n.reason + "..."), exports.utils.timeout(n.delay, function() {
                          return exports.showSurvey(t, n.params, {
                              onShow: e.onShow,
                              onShowComment: e.onShowComment,
                              onRespond: e.onRespond,
                              onComment: e.onComment,
                              onAqAnswer: e.onAqAnswer,
                              onHide: function() {
                                  return function() {
                                      if (d.activeSurveyContextId === t.SURVEY_CONTEXT_ID && delete d.activeSurveyContextId, e.onHide)
                                          return e.onHide()
                                  }
                              }(this),
                              buttonAnimationDirection: e.buttonAnimationDirection,
                              disableShowAnimations: e.disableShowAnimations || n.isRedisplay,
                              disableShowCommentAnimations: e.disableShowCommentAnimations,
                              disableScrollLock: e.disableScrollLock,
                              offsets: e.offsets,
                              mobileScoreOrdering: e.mobileScoreOrdering,
                              darkBackground: e.darkBackground
                          })
                      })) : (t.LOGGER.info("Survey not shown because " + n.reason + "."), d.activeSurveyContextId === t.SURVEY_CONTEXT_ID ? delete d.activeSurveyContextId : void 0))
                  }, n.reset = function() {
                      return t.LOGGER.debug("Reset called."), t.TELEMETRY.instrument("RESET_CALLED"), t.STATE_MANAGER.reset()
                  }, (t.IS_TEST || /reset/.test(u.delighted)) && n.reset(), c = [], r = 0, s = n.length; r < s; r++)
                      l = n[r],
                      i = l[0],
                      e = l[1],
                      t.LOGGER.debug("Dequeued:", i, e),
                      c.push(n[i].apply(n, e));
                  return c
              }
          }
      }.call(this);
      exports.loadDelightedLibrary({
          "ENV": "production",
          "ACTIVE": true,
          "LOG_LEVEL": null,
          "SURVEY_CONTEXT_ID": "XFBFIHGZYX4ezwQq",
          "NAME": "delighted",
          "WRITE_KEY": "FdsUYorkkY9rx0DM",
          "PREVIEW_MODE": false,
          "DEFAULT_SURVEY_TYPE": {
              "id": "nps",
              "human_name_short": "NPS",
              "aggregate_score_name_short": "NPS",
              "aggregate_score_range": [-100, 100],
              "groups": [{
                  "id": "promoter",
                  "id_pluralized": "promoters",
                  "id_dasherized": "promoter",
                  "smiley_name": "promoter",
                  "scores_gte": 9,
                  "scores_lte": 10,
                  "human_name": "promoter",
                  "human_name_pluralized": "promoters",
                  "human_name_titleized": "Promoter",
                  "human_name_titleized_pluralized": "Promoters",
                  "baked_score": false,
                  "color_bg": "#bed900",
                  "color_fg": "#a1b800"
              }, {
                  "id": "passive",
                  "id_pluralized": "passives",
                  "id_dasherized": "passive",
                  "smiley_name": "passive",
                  "scores_gte": 7,
                  "scores_lte": 8,
                  "human_name": "passive",
                  "human_name_pluralized": "passives",
                  "human_name_titleized": "Passive",
                  "human_name_titleized_pluralized": "Passives",
                  "baked_score": false,
                  "color_bg": "#e0e0d9",
                  "color_fg": "#90908f"
              }, {
                  "id": "detractor",
                  "id_pluralized": "detractors",
                  "id_dasherized": "detractor",
                  "smiley_name": "detractor",
                  "scores_gte": 0,
                  "scores_lte": 6,
                  "human_name": "detractor",
                  "human_name_pluralized": "detractors",
                  "human_name_titleized": "Detractor",
                  "human_name_titleized_pluralized": "Detractors",
                  "baked_score": false,
                  "color_bg": "#e43300",
                  "color_fg": "#e43300"
              }],
              "groups_by_score": {
                  "9": {
                      "id": "promoter",
                      "id_pluralized": "promoters",
                      "id_dasherized": "promoter",
                      "smiley_name": "promoter",
                      "scores_gte": 9,
                      "scores_lte": 10,
                      "human_name": "promoter",
                      "human_name_pluralized": "promoters",
                      "human_name_titleized": "Promoter",
                      "human_name_titleized_pluralized": "Promoters",
                      "baked_score": false,
                      "color_bg": "#bed900",
                      "color_fg": "#a1b800"
                  },
                  "10": {
                      "id": "promoter",
                      "id_pluralized": "promoters",
                      "id_dasherized": "promoter",
                      "smiley_name": "promoter",
                      "scores_gte": 9,
                      "scores_lte": 10,
                      "human_name": "promoter",
                      "human_name_pluralized": "promoters",
                      "human_name_titleized": "Promoter",
                      "human_name_titleized_pluralized": "Promoters",
                      "baked_score": false,
                      "color_bg": "#bed900",
                      "color_fg": "#a1b800"
                  },
                  "7": {
                      "id": "passive",
                      "id_pluralized": "passives",
                      "id_dasherized": "passive",
                      "smiley_name": "passive",
                      "scores_gte": 7,
                      "scores_lte": 8,
                      "human_name": "passive",
                      "human_name_pluralized": "passives",
                      "human_name_titleized": "Passive",
                      "human_name_titleized_pluralized": "Passives",
                      "baked_score": false,
                      "color_bg": "#e0e0d9",
                      "color_fg": "#90908f"
                  },
                  "8": {
                      "id": "passive",
                      "id_pluralized": "passives",
                      "id_dasherized": "passive",
                      "smiley_name": "passive",
                      "scores_gte": 7,
                      "scores_lte": 8,
                      "human_name": "passive",
                      "human_name_pluralized": "passives",
                      "human_name_titleized": "Passive",
                      "human_name_titleized_pluralized": "Passives",
                      "baked_score": false,
                      "color_bg": "#e0e0d9",
                      "color_fg": "#90908f"
                  },
                  "0": {
                      "id": "detractor",
                      "id_pluralized": "detractors",
                      "id_dasherized": "detractor",
                      "smiley_name": "detractor",
                      "scores_gte": 0,
                      "scores_lte": 6,
                      "human_name": "detractor",
                      "human_name_pluralized": "detractors",
                      "human_name_titleized": "Detractor",
                      "human_name_titleized_pluralized": "Detractors",
                      "baked_score": false,
                      "color_bg": "#e43300",
                      "color_fg": "#e43300"
                  },
                  "1": {
                      "id": "detractor",
                      "id_pluralized": "detractors",
                      "id_dasherized": "detractor",
                      "smiley_name": "detractor",
                      "scores_gte": 0,
                      "scores_lte": 6,
                      "human_name": "detractor",
                      "human_name_pluralized": "detractors",
                      "human_name_titleized": "Detractor",
                      "human_name_titleized_pluralized": "Detractors",
                      "baked_score": false,
                      "color_bg": "#e43300",
                      "color_fg": "#e43300"
                  },
                  "2": {
                      "id": "detractor",
                      "id_pluralized": "detractors",
                      "id_dasherized": "detractor",
                      "smiley_name": "detractor",
                      "scores_gte": 0,
                      "scores_lte": 6,
                      "human_name": "detractor",
                      "human_name_pluralized": "detractors",
                      "human_name_titleized": "Detractor",
                      "human_name_titleized_pluralized": "Detractors",
                      "baked_score": false,
                      "color_bg": "#e43300",
                      "color_fg": "#e43300"
                  },
                  "3": {
                      "id": "detractor",
                      "id_pluralized": "detractors",
                      "id_dasherized": "detractor",
                      "smiley_name": "detractor",
                      "scores_gte": 0,
                      "scores_lte": 6,
                      "human_name": "detractor",
                      "human_name_pluralized": "detractors",
                      "human_name_titleized": "Detractor",
                      "human_name_titleized_pluralized": "Detractors",
                      "baked_score": false,
                      "color_bg": "#e43300",
                      "color_fg": "#e43300"
                  },
                  "4": {
                      "id": "detractor",
                      "id_pluralized": "detractors",
                      "id_dasherized": "detractor",
                      "smiley_name": "detractor",
                      "scores_gte": 0,
                      "scores_lte": 6,
                      "human_name": "detractor",
                      "human_name_pluralized": "detractors",
                      "human_name_titleized": "Detractor",
                      "human_name_titleized_pluralized": "Detractors",
                      "baked_score": false,
                      "color_bg": "#e43300",
                      "color_fg": "#e43300"
                  },
                  "5": {
                      "id": "detractor",
                      "id_pluralized": "detractors",
                      "id_dasherized": "detractor",
                      "smiley_name": "detractor",
                      "scores_gte": 0,
                      "scores_lte": 6,
                      "human_name": "detractor",
                      "human_name_pluralized": "detractors",
                      "human_name_titleized": "Detractor",
                      "human_name_titleized_pluralized": "Detractors",
                      "baked_score": false,
                      "color_bg": "#e43300",
                      "color_fg": "#e43300"
                  },
                  "6": {
                      "id": "detractor",
                      "id_pluralized": "detractors",
                      "id_dasherized": "detractor",
                      "smiley_name": "detractor",
                      "scores_gte": 0,
                      "scores_lte": 6,
                      "human_name": "detractor",
                      "human_name_pluralized": "detractors",
                      "human_name_titleized": "Detractor",
                      "human_name_titleized_pluralized": "Detractors",
                      "baked_score": false,
                      "color_bg": "#e43300",
                      "color_fg": "#e43300"
                  }
              },
              "chart_y_tick_values": [-100, -50, 0, 50, 100],
              "chart_y_domain": [-125, 125]
          },
          "DEFAULT_INITIAL_DELAY": 0,
          "DEFAULT_RECURRING_PERIOD": null,
          "DEFAULT_FORCE_DISPLAY": false,
          "DEFAULT_MIN_TIME_ON_PAGE": 2,
          "DEFAULT_MIN_TIME_FOR_DISPLAY": 120,
          "DEFAULT_MIN_SURVEY_INTERVAL": 2592000,
          "DEFAULT_SAMPLE_FACTOR": 1.0,
          "PLAN_LIMIT_EXHAUSTED": null,
          "ENABLE_TOUCH_PLATFORMS": true,
          "OVERRIDE_EXPERIMENT_TREATMENTS": {},
          "COOKIE_NAME": "_delighted_web",
          "COOKIE_EXPIRY_DAYS": 3650,
          "COOKIE_LAST_SURVEYED_TIMESTAMP": "_delighted_lst",
          "COOKIE_LAST_SURVEYED_TIMESTAMP_EXPIRY_DAYS": 3650,
          "COOKIE_LAST_RESPONDED_TIMESTAMP": "_delighted_lrt",
          "COOKIE_LAST_RESPONDED_TIMESTAMP_EXPIRY_DAYS": 3650,
          "COOKIE_FIRST_SEEN_TIMESTAMP": "_delighted_fst",
          "COOKIE_FIRST_SEEN_TIMESTAMP_EXPIRY_DAYS": 3650,
          "COOKIE_IS_TEST": "_delighted_tst",
          "COOKIE_IS_DEBUG": "_delighted_dbg",
          "NEVER_FUTURE_TIMESTAMP": 4618380874000,
          "NEVER_PAST_TIMESTAMP": -1693048870000,
          "RETURN_DELAY": 21600,
          "PREFIX_PROPERTIES": true,
          "SURVEY_URL": "https://web.delighted.com/t/3nxkFfei",
          "TELEMETRY_URL": "https://web.delighted.com/integrations/web/v1/telemetry/FdsUYorkkY9rx0DM"
      });
  })();
} catch (e) {
    console.log("=================3===============", e);
  if (console && console.error) {
      // :ALLOW_CONSOLE:
      var message;
      try {
          message = (e && e.message) || String(e);
      } catch (e) {}
      ;
      console.log("[Delighted] Error loading: ", message); // :ALLOW_CONSOLE:
  }
}