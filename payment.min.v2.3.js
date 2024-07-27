var navigator = {
  "appName": "Netscape",
  "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
}

var window = {
  "crypto": {
    "getRandomValues": function getRandomValues(array) {
      for (var i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }      
    }
  },
  "location": {
    "href": "https://abema.tv"
  }
}

function Uint32Array(length) {
  this.length = length;
  this.buffer = new Array(length);
  for (var i = 0; i < length; i++) {
      this.buffer[i] = 0;
  }
}

Uint32Array.prototype.get = function(index) {
  if (index >= this.length || index < 0) {
      throw new RangeError('Index out of bounds');
  }
  return this.buffer[index];
};

Uint32Array.prototype.set = function(index, value) {
  if (index >= this.length || index < 0) {
      throw new RangeError('Index out of bounds');
  }
  // Ensure the value is a 32-bit unsigned integer
  this.buffer[index] = value >>> 0;
};

var CryptoJS = CryptoJS || function (t, e) {
  var i = {}
    , r = i.lib = {}
    , n = function () { }
    , s = r.Base = {
      extend: function (t) {
        n.prototype = this;
        var e = new n;
        return t && e.mixIn(t),
          e.hasOwnProperty("init") || (e.init = function () {
            e.$super.init.apply(this, arguments)
          }
          ),
          e.init.prototype = e,
          e.$super = this,
          e
      },
      create: function () {
        var t = this.extend();
        return t.init.apply(t, arguments),
          t
      },
      init: function () { },
      mixIn: function (t) {
        for (var e in t)
          t.hasOwnProperty(e) && (this[e] = t[e]);
        t.hasOwnProperty("toString") && (this.toString = t.toString)
      },
      clone: function () {
        return this.init.prototype.extend(this)
      }
    }
    , o = r.WordArray = s.extend({
      init: function (t, i) {
        t = this.words = t || [],
          this.sigBytes = i != e ? i : 4 * t.length
      },
      toString: function (t) {
        return (t || h).stringify(this)
      },
      concat: function (t) {
        var e = this.words
          , i = t.words
          , r = this.sigBytes;
        if (t = t.sigBytes,
          this.clamp(),
          r % 4)
          for (var n = 0; n < t; n++)
            e[r + n >>> 2] |= (i[n >>> 2] >>> 24 - 8 * (n % 4) & 255) << 24 - 8 * ((r + n) % 4);
        else if (65535 < i.length)
          for (n = 0; n < t; n += 4)
            e[r + n >>> 2] = i[n >>> 2];
        else
          e.push.apply(e, i);
        return this.sigBytes += t,
          this
      },
      clamp: function () {
        var e = this.words
          , i = this.sigBytes;
        e[i >>> 2] &= 4294967295 << 32 - 8 * (i % 4),
          e.length = t.ceil(i / 4)
      },
      clone: function () {
        var t = s.clone.call(this);
        return t.words = this.words.slice(0),
          t
      },
      random: function (e) {
        for (var i = [], r = 0; r < e; r += 4)
          i.push(4294967296 * t.random() | 0);
        return new o.init(i, e)
      }
    })
    , a = i.enc = {}
    , h = a.Hex = {
      stringify: function (t) {
        var e = t.words;
        t = t.sigBytes;
        for (var i = [], r = 0; r < t; r++) {
          var n = e[r >>> 2] >>> 24 - 8 * (r % 4) & 255;
          i.push((n >>> 4).toString(16)),
            i.push((15 & n).toString(16))
        }
        return i.join("")
      }
    }
    , c = a.Latin1 = {
      parse: function (t) {
        for (var e = t.length, i = [], r = 0; r < e; r++)
          i[r >>> 2] |= (255 & t.charCodeAt(r)) << 24 - 8 * (r % 4);
        return new o.init(i, e)
      }
    }
    , u = a.Utf8 = {
      parse: function (t) {
        return c.parse(unescape(encodeURIComponent(t)))
      }
    }
    , f = r.BufferedBlockAlgorithm = s.extend({
      reset: function () {
        this._data = new o.init,
          this._nDataBytes = 0
      },
      _append: function (t) {
        "string" == typeof t && (t = u.parse(t)),
          this._data.concat(t),
          this._nDataBytes += t.sigBytes
      },
      _process: function (e) {
        var i = this._data
          , r = i.words
          , n = i.sigBytes
          , s = this.blockSize
          , a = n / (4 * s)
          , a = e ? t.ceil(a) : t.max((0 | a) - this._minBufferSize, 0);
        if (e = a * s,
          n = t.min(4 * e, n),
          e) {
          for (var h = 0; h < e; h += s)
            this._doProcessBlock(r, h);
          h = r.splice(0, e),
            i.sigBytes -= n
        }
        return new o.init(h, n)
      },
      _minBufferSize: 0
    });
  r.Hasher = f.extend({
    cfg: s.extend(),
    init: function (t) {
      this.cfg = this.cfg.extend(t),
        this.reset()
    },
    reset: function () {
      f.reset.call(this),
        this._doReset()
    },
    update: function (t) {
      return this._append(t),
        this._process(),
        this
    },
    finalize: function (t) {
      return t && this._append(t),
        this._doFinalize()
    },
    blockSize: 16,
    _createHelper: function (t) {
      return function (e, i) {
        return new t.init(i).finalize(e)
      }
    },
    _createHmacHelper: function (t) {}
  });
  var l = i.algo = {};
  return i
}(Math);
!function () {
  var t = CryptoJS
  t.enc.Base64 = {
    stringify: function (t) {
      var e = t.words
        , i = t.sigBytes
        , r = this._map;
      t.clamp(),
        t = [];
      for (var n = 0; n < i; n += 3)
        for (var s = (e[n >>> 2] >>> 24 - 8 * (n % 4) & 255) << 16 | (e[n + 1 >>> 2] >>> 24 - 8 * ((n + 1) % 4) & 255) << 8 | e[n + 2 >>> 2] >>> 24 - 8 * ((n + 2) % 4) & 255, o = 0; 4 > o && n + .75 * o < i; o++)
          t.push(r.charAt(s >>> 6 * (3 - o) & 63));
      if (e = r.charAt(64))
        for (; t.length % 4;)
          t.push(e);
      return t.join("")
    },
    _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  }
}(),
  CryptoJS.lib.Cipher || function (t) {
    var e = CryptoJS
      , i = e.lib
      , r = i.Base
      , n = i.WordArray
      , s = i.BufferedBlockAlgorithm
      , o = e.enc.Base64
      , h = i.Cipher = s.extend({
        cfg: r.extend(),
        createEncryptor: function (t, e) {
          return this.create(this._ENC_XFORM_MODE, t, e)
        },
        init: function (t, e, i) {
          this.cfg = this.cfg.extend(i),
            this._xformMode = t,
            this._key = e,
            this.reset()
        },
        reset: function () {
          s.reset.call(this),
            this._doReset()
        },
        finalize: function (t) {
          return t && this._append(t),
            this._doFinalize()
        },
        keySize: 4,
        ivSize: 4,
        _ENC_XFORM_MODE: 1,
        _DEC_XFORM_MODE: 2,
        _createHelper: function (t) {
          return {
            encrypt: function (e, i, r) {
              return ("string" == typeof i ? d : p).encrypt(t, e, i, r)
            }
          }
        }
      });
    i.StreamCipher = h.extend({
      blockSize: 1
    });
    var c = e.mode = {}
      , u = function (e, i, r) {
        var n = this._iv;
        n ? this._iv = t : n = this._prevBlock;
        for (var s = 0; s < r; s++)
          e[i + s] ^= n[s]
      }
      , f = (i.BlockCipherMode = r.extend({
        createEncryptor: function (t, e) {
          return this.Encryptor.create(t, e)
        },
        init: function (t, e) {
          this._cipher = t,
            this._iv = e
        }
      })).extend();
    f.Encryptor = f.extend({
      processBlock: function (t, e) {
        var i = this._cipher
          , r = i.blockSize;
        u.call(this, t, e, r),
          i.encryptBlock(t, e),
          this._prevBlock = t.slice(e, e + r)
      }
    }),
      c = c.CBC = f,
      f = (e.pad = {}).Pkcs7 = {
        pad: function (t, e) {
          for (var i = 4 * e, i = i - t.sigBytes % i, r = i << 24 | i << 16 | i << 8 | i, s = [], o = 0; o < i; o += 4)
            s.push(r);
          i = n.create(s, i),
            t.concat(i)
        }
      },
      i.BlockCipher = h.extend({
        cfg: h.cfg.extend({
          mode: c,
          padding: f
        }),
        reset: function () {
          h.reset.call(this);
          var t = this.cfg
            , e = t.iv
            , t = t.mode;
          if (this._xformMode == this._ENC_XFORM_MODE)
            var i = t.createEncryptor;
          else
            i = t.createDecryptor,
              this._minBufferSize = 1;
          this._mode = i.call(t, this, e && e.words)
        },
        _doProcessBlock: function (t, e) {
          this._mode.processBlock(t, e)
        },
        _doFinalize: function () {
          var t = this.cfg.padding;
          if (this._xformMode == this._ENC_XFORM_MODE) {
            t.pad(this._data, this.blockSize);
            var e = this._process(!0)
          } else
            e = this._process(!0),
              t.unpad(e);
          return e
        },
        blockSize: 4
      });
    var l = i.CipherParams = r.extend({
      init: function (t) {
        this.mixIn(t)
      },
      toString: function (t) {
        return (t || this.formatter).stringify(this)
      }
    })
      , c = (e.format = {}).OpenSSL = {
        stringify: function (t) {
          var e = t.ciphertext;
          return t = t.salt,
            (t ? n.create([1398893684, 1701076831]).concat(t).concat(e) : e).toString(o)
        }
      }
      , p = i.SerializableCipher = r.extend({
        cfg: r.extend({
          format: c
        }),
        encrypt: function (t, e, i, r) {
          r = this.cfg.extend(r);
          var n = t.createEncryptor(i, r);
          return e = n.finalize(e),
            n = n.cfg,
            l.create({
              ciphertext: e,
              key: i,
              iv: n.iv,
              algorithm: t,
              mode: n.mode,
              padding: n.padding,
              blockSize: t.blockSize,
              formatter: r.format
            })
        }
      })
      , d = i.PasswordBasedCipher = p.extend({
        cfg: p.cfg.extend({
          kdf: e
        })
      })
  }(),
  function () {
    for (var t = CryptoJS, e = t.lib.BlockCipher, i = t.algo, r = [], n = [], s = [], o = [], a = [], h = [], c = [], u = [], f = [], l = [], p = [], d = 0; 256 > d; d++)
      p[d] = 128 > d ? d << 1 : d << 1 ^ 283;
    for (var g = 0, y = 0, d = 0; 256 > d; d++) {
      var v = y ^ y << 1 ^ y << 2 ^ y << 3 ^ y << 4
        , v = v >>> 8 ^ 255 & v ^ 99;
      r[g] = v,
        n[v] = g;
      var m = p[g]
        , b = p[m]
        , S = p[b]
        , T = 257 * p[v] ^ 16843008 * v;
      s[g] = T << 24 | T >>> 8,
        o[g] = T << 16 | T >>> 16,
        a[g] = T << 8 | T >>> 24,
        h[g] = T,
        T = 16843009 * S ^ 65537 * b ^ 257 * m ^ 16843008 * g,
        c[v] = T << 24 | T >>> 8,
        u[v] = T << 16 | T >>> 16,
        f[v] = T << 8 | T >>> 24,
        l[v] = T,
        g ? (g = m ^ p[p[p[S ^ m]]],
          y ^= p[p[y]]) : g = y = 1
    }
    var w = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54]
      , i = i.AES = e.extend({
        _doReset: function () {
          for (var t = this._key, e = t.words, i = t.sigBytes / 4, t = 4 * ((this._nRounds = i + 6) + 1), n = this._keySchedule = [], s = 0; s < t; s++)
            if (s < i)
              n[s] = e[s];
            else {
              var o = n[s - 1];
              s % i ? 6 < i && 4 == s % i && (o = r[o >>> 24] << 24 | r[o >>> 16 & 255] << 16 | r[o >>> 8 & 255] << 8 | r[255 & o]) : (o = o << 8 | o >>> 24,
                o = r[o >>> 24] << 24 | r[o >>> 16 & 255] << 16 | r[o >>> 8 & 255] << 8 | r[255 & o],
                o ^= w[s / i | 0] << 24),
                n[s] = n[s - i] ^ o
            }
          for (e = this._invKeySchedule = [],
            i = 0; i < t; i++)
            s = t - i,
              o = i % 4 ? n[s] : n[s - 4],
              e[i] = 4 > i || 4 >= s ? o : c[r[o >>> 24]] ^ u[r[o >>> 16 & 255]] ^ f[r[o >>> 8 & 255]] ^ l[r[255 & o]]
        },
        encryptBlock: function (t, e) {
          this._doCryptBlock(t, e, this._keySchedule, s, o, a, h, r)
        },
        _doCryptBlock: function (t, e, i, r, n, s, o, a) {
          for (var h = this._nRounds, c = t[e] ^ i[0], u = t[e + 1] ^ i[1], f = t[e + 2] ^ i[2], l = t[e + 3] ^ i[3], p = 4, d = 1; d < h; d++)
            var g = r[c >>> 24] ^ n[u >>> 16 & 255] ^ s[f >>> 8 & 255] ^ o[255 & l] ^ i[p++]
              , y = r[u >>> 24] ^ n[f >>> 16 & 255] ^ s[l >>> 8 & 255] ^ o[255 & c] ^ i[p++]
              , v = r[f >>> 24] ^ n[l >>> 16 & 255] ^ s[c >>> 8 & 255] ^ o[255 & u] ^ i[p++]
              , l = r[l >>> 24] ^ n[c >>> 16 & 255] ^ s[u >>> 8 & 255] ^ o[255 & f] ^ i[p++]
              , c = g
              , u = y
              , f = v;
          g = (a[c >>> 24] << 24 | a[u >>> 16 & 255] << 16 | a[f >>> 8 & 255] << 8 | a[255 & l]) ^ i[p++],
            y = (a[u >>> 24] << 24 | a[f >>> 16 & 255] << 16 | a[l >>> 8 & 255] << 8 | a[255 & c]) ^ i[p++],
            v = (a[f >>> 24] << 24 | a[l >>> 16 & 255] << 16 | a[c >>> 8 & 255] << 8 | a[255 & u]) ^ i[p++],
            l = (a[l >>> 24] << 24 | a[c >>> 16 & 255] << 16 | a[u >>> 8 & 255] << 8 | a[255 & f]) ^ i[p++],
            t[e] = g,
            t[e + 1] = y,
            t[e + 2] = v,
            t[e + 3] = l
        },
        keySize: 8
      });
    t.AES = e._createHelper(i)
  }();
!function () {
  var t = CryptoJS
    , e = t.lib
    , i = e.WordArray
    , r = e.Hasher
    , n = []
    , e = t.algo.SHA1 = r.extend({
      _doReset: function () {
        this._hash = new i.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
      },
      _doProcessBlock: function (t, e) {
        for (var i = this._hash.words, r = i[0], s = i[1], o = i[2], a = i[3], h = i[4], c = 0; 80 > c; c++) {
          if (16 > c)
            n[c] = 0 | t[e + c];
          else {
            var u = n[c - 3] ^ n[c - 8] ^ n[c - 14] ^ n[c - 16];
            n[c] = u << 1 | u >>> 31
          }
          u = (r << 5 | r >>> 27) + h + n[c],
            u = 20 > c ? u + ((s & o | ~s & a) + 1518500249) : 40 > c ? u + ((s ^ o ^ a) + 1859775393) : 60 > c ? u + ((s & o | s & a | o & a) - 1894007588) : u + ((s ^ o ^ a) - 899497514),
            h = a,
            a = o,
            o = s << 30 | s >>> 2,
            s = r,
            r = u
        }
        i[0] = i[0] + r | 0,
          i[1] = i[1] + s | 0,
          i[2] = i[2] + o | 0,
          i[3] = i[3] + a | 0,
          i[4] = i[4] + h | 0
      },
      _doFinalize: function () {
        var t = this._data
          , e = t.words
          , i = 8 * this._nDataBytes
          , r = 8 * t.sigBytes;
        return e[r >>> 5] |= 128 << 24 - r % 32,
          e[(r + 64 >>> 9 << 4) + 14] = Math.floor(i / 4294967296),
          e[(r + 64 >>> 9 << 4) + 15] = i,
          t.sigBytes = 4 * e.length,
          this._process(),
          this._hash
      }
    });
  t.SHA1 = r._createHelper(e),
    t.HmacSHA1 = r._createHmacHelper(e)
}(),
  function () {
    var t = CryptoJS
      , e = t.enc.Utf8;
    t.algo.HMAC = t.lib.Base.extend({
      init: function (t, i) {
        t = this._hasher = new t.init,
          "string" == typeof i && (i = e.parse(i));
        var r = t.blockSize
          , n = 4 * r;
        i.sigBytes > n && (i = t.finalize(i)),
          i.clamp();
        for (var s = this._oKey = i.clone(), o = this._iKey = i.clone(), a = s.words, h = o.words, c = 0; c < r; c++)
          a[c] ^= 1549556828,
            h[c] ^= 909522486;
        s.sigBytes = o.sigBytes = n,
          this.reset()
      },
      reset: function () {
        var t = this._hasher;
        t.reset(),
          t.update(this._iKey)
      },
      update: function (t) {
        return this._hasher.update(t),
          this
      },
      finalize: function (t) {
        var e = this._hasher;
        return t = e.finalize(t),
          e.reset(),
          e.finalize(this._oKey.clone().concat(t))
      }
    })
  }(),
  function () {
    var t = CryptoJS
      , e = t.lib
      , i = e.Base
      , r = e.WordArray
      , e = t.algo
      , n = e.HMAC
      , s = e.PBKDF2 = i.extend({
        cfg: i.extend({
          keySize: 4,
          hasher: e.SHA1,
          iterations: 1
        }),
        init: function (t) {
          this.cfg = this.cfg.extend(t)
        },
        compute: function (t, e) {
          for (var i = this.cfg, s = n.create(i.hasher, t), o = r.create(), a = r.create([1]), h = o.words, c = a.words, u = i.keySize, i = i.iterations; h.length < u;) {
            var f = s.update(e).finalize(a);
            s.reset();
            for (var l = f.words, p = l.length, d = f, g = 1; g < i; g++) {
              d = s.finalize(d),
                s.reset();
              for (var y = d.words, v = 0; v < p; v++)
                l[v] ^= y[v]
            }
            o.concat(f),
              c[0]++
          }
          return o.sigBytes = 4 * u,
            o
        }
      });
    t.PBKDF2 = function (t, e, i) {
      return s.create(i).compute(t, e)
    }
  }();
!function () {
  var t = CryptoJS
    , e = t.lib
    , i = e.WordArray
    , r = e.Hasher
    , n = []
    , e = t.algo.SHA1 = r.extend({
      _doReset: function () {
        this._hash = new i.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
      },
      _doProcessBlock: function (t, e) {
        for (var i = this._hash.words, r = i[0], s = i[1], o = i[2], a = i[3], h = i[4], c = 0; 80 > c; c++) {
          if (16 > c)
            n[c] = 0 | t[e + c];
          else {
            var u = n[c - 3] ^ n[c - 8] ^ n[c - 14] ^ n[c - 16];
            n[c] = u << 1 | u >>> 31
          }
          u = (r << 5 | r >>> 27) + h + n[c],
            u = 20 > c ? u + ((s & o | ~s & a) + 1518500249) : 40 > c ? u + ((s ^ o ^ a) + 1859775393) : 60 > c ? u + ((s & o | s & a | o & a) - 1894007588) : u + ((s ^ o ^ a) - 899497514),
            h = a,
            a = o,
            o = s << 30 | s >>> 2,
            s = r,
            r = u
        }
        i[0] = i[0] + r | 0,
          i[1] = i[1] + s | 0,
          i[2] = i[2] + o | 0,
          i[3] = i[3] + a | 0,
          i[4] = i[4] + h | 0
      },
      _doFinalize: function () {
        var t = this._data
          , e = t.words
          , i = 8 * this._nDataBytes
          , r = 8 * t.sigBytes;
        return e[r >>> 5] |= 128 << 24 - r % 32,
          e[(r + 64 >>> 9 << 4) + 14] = Math.floor(i / 4294967296),
          e[(r + 64 >>> 9 << 4) + 15] = i,
          t.sigBytes = 4 * e.length,
          this._process(),
          this._hash
      }
    });
  t.SHA1 = r._createHelper(e),
    t.HmacSHA1 = r._createHmacHelper(e)
}();
var JSEncryptExports = {};
!function (t) {
  function e(t, e, i) {
    null != t && ("number" == typeof t ? this.fromNumber(t, e, i) : null == e && "string" != typeof t ? this.fromString(t, 256) : this.fromString(t, e))
  }
  function i() {
    return new e(null)
  }

  function s(t, e, i, r, n, s) {
    for (var o = 16383 & e, a = e >> 14; --s >= 0;) {
      var h = 16383 & this[t]
        , c = this[t++] >> 14
        , u = a * h + c * o;
      h = o * h + ((16383 & u) << 14) + i[r] + n,
        n = (h >> 28) + (u >> 14) + a * c,
        i[r++] = 268435455 & h
    }
    return n
  }
  function o(t) {
    return De.charAt(t)
  }
  function a(t, e) {
    var i = _e[t.charCodeAt(e)];
    return null == i ? -1 : i
  }
  function h(t) {
    for (var e = this.t - 1; e >= 0; --e)
      t[e] = this[e];
    t.t = this.t,
      t.s = this.s
  }
  function c(t) {
    this.t = 1,
      this.s = 0 > t ? -1 : 0,
      t > 0 ? this[0] = t : -1 > t ? this[0] = t + DV : this.t = 0
  }
  function u(t) {
    var e = i();
    return e.fromInt(t),
      e
  }
  function f(t, i) {
    var r;
    if (16 == i)
      r = 4;
    else if (8 == i)
      r = 3;
    else if (256 == i)
      r = 8;
    else if (2 == i)
      r = 1;
    else if (32 == i)
      r = 5;
    else {
      if (4 != i)
        return void this.fromRadix(t, i);
      r = 2
    }
    this.t = 0,
      this.s = 0;
    for (var n = t.length, s = !1, o = 0; --n >= 0;) {
      var h = 8 == r ? 255 & t[n] : a(t, n);
      0 > h ? "-" == t.charAt(n) && (s = !0) : (s = !1,
        0 == o ? this[this.t++] = h : o + r > this.DB ? (this[this.t - 1] |= (h & (1 << this.DB - o) - 1) << o,
          this[this.t++] = h >> this.DB - o) : this[this.t - 1] |= h << o,
        o += r,
        o >= this.DB && (o -= this.DB))
    }
    8 == r && 0 != (128 & t[0]) && (this.s = -1,
      o > 0 && (this[this.t - 1] |= (1 << this.DB - o) - 1 << o)),
      this.clamp(),
      s && e.ZERO.subTo(this, this)
  }
  function l() {
    for (var t = this.s & this.DM; this.t > 0 && this[this.t - 1] == t;)
      --this.t
  }
  function p(t) {
    if (this.s < 0)
      return "-" + this.negate().toString(t);
    var e;
    if (16 == t)
      e = 4;
    else if (8 == t)
      e = 3;
    else if (2 == t)
      e = 1;
    else if (32 == t)
      e = 5;
    else {
      if (4 != t)
        return this.toRadix(t);
      e = 2
    }
    var i, r = (1 << e) - 1, n = !1, s = "", a = this.t, h = this.DB - a * this.DB % e;
    if (a-- > 0)
      for (h < this.DB && (i = this[a] >> h) > 0 && (n = !0,
        s = o(i)); a >= 0;)
        e > h ? (i = (this[a] & (1 << h) - 1) << e - h,
          i |= this[--a] >> (h += this.DB - e)) : (i = this[a] >> (h -= e) & r,
            0 >= h && (h += this.DB,
              --a)),
          i > 0 && (n = !0),
          n && (s += o(i));
    return n ? s : "0"
  }

  function g() {
    return this.s < 0 ? this.negate() : this
  }
  function y(t) {
    var e = this.s - t.s;
    if (0 != e)
      return e;
    var i = this.t;
    if (e = i - t.t,
      0 != e)
      return this.s < 0 ? -e : e;
    for (; --i >= 0;)
      if (0 != (e = this[i] - t[i]))
        return e;
    return 0
  }
  function m(t) {
    var e, i = 1;
    return 0 != (e = t >>> 16) && (t = e,
      i += 16),
      0 != (e = t >> 8) && (t = e,
        i += 8),
      0 != (e = t >> 4) && (t = e,
        i += 4),
      0 != (e = t >> 2) && (t = e,
        i += 2),
      0 != (e = t >> 1) && (t = e,
        i += 1),
      i
  }
  function b() {
    return this.t <= 0 ? 0 : this.DB * (this.t - 1) + m(this[this.t - 1] ^ this.s & this.DM)
  }
  function S(t, e) {
    var i;
    for (i = this.t - 1; i >= 0; --i)
      e[i + t] = this[i];
    for (i = t - 1; i >= 0; --i)
      e[i] = 0;
    e.t = this.t + t,
      e.s = this.s
  }
  function T(t, e) {
    for (var i = t; i < this.t; ++i)
      e[i - t] = this[i];
    e.t = Math.max(this.t - t, 0),
      e.s = this.s
  }
  function w(t, e) {
    var i, r = t % this.DB, n = this.DB - r, s = (1 << n) - 1, o = Math.floor(t / this.DB), a = this.s << r & this.DM;
    for (i = this.t - 1; i >= 0; --i)
      e[i + o + 1] = this[i] >> n | a,
        a = (this[i] & s) << r;
    for (i = o - 1; i >= 0; --i)
      e[i] = 0;
    e[o] = a,
      e.t = this.t + o + 1,
      e.s = this.s,
      e.clamp()
  }
  function E(t, e) {
    e.s = this.s;
    var i = Math.floor(t / this.DB);
    if (i >= this.t)
      return void (e.t = 0);
    var r = t % this.DB
      , n = this.DB - r
      , s = (1 << r) - 1;
    e[0] = this[i] >> r;
    for (var o = i + 1; o < this.t; ++o)
      e[o - i - 1] |= (this[o] & s) << n,
        e[o - i] = this[o] >> r;
    r > 0 && (e[this.t - i - 1] |= (this.s & s) << n),
      e.t = this.t - i,
      e.clamp()
  }
  function x(t, e) {
    for (var i = 0, r = 0, n = Math.min(t.t, this.t); n > i;)
      r += this[i] - t[i],
        e[i++] = r & this.DM,
        r >>= this.DB;
    if (t.t < this.t) {
      for (r -= t.s; i < this.t;)
        r += this[i],
          e[i++] = r & this.DM,
          r >>= this.DB;
      r += this.s
    } else {
      for (r += this.s; i < t.t;)
        r -= t[i],
          e[i++] = r & this.DM,
          r >>= this.DB;
      r -= t.s
    }
    e.s = 0 > r ? -1 : 0,
      -1 > r ? e[i++] = this.DV + r : r > 0 && (e[i++] = r),
      e.t = i,
      e.clamp()
  }
  function R(t, i) {
    var r = this.abs()
      , n = t.abs()
      , s = r.t;
    for (i.t = s + n.t; --s >= 0;)
      i[s] = 0;
    for (s = 0; s < n.t; ++s)
      i[s + r.t] = r.am(0, n[s], i, s, 0, r.t);
    i.s = 0,
      i.clamp(),
      this.s != t.s && e.ZERO.subTo(i, i)
  }
  function B(t) {
    for (var e = this.abs(), i = t.t = 2 * e.t; --i >= 0;)
      t[i] = 0;
    for (i = 0; i < e.t - 1; ++i) {
      var r = e.am(i, e[i], t, 2 * i, 0, 1);
      (t[i + e.t] += e.am(i + 1, 2 * e[i], t, 2 * i + 1, r, e.t - i - 1)) >= e.DV && (t[i + e.t] -= e.DV,
        t[i + e.t + 1] = 1)
    }
    t.t > 0 && (t[t.t - 1] += e.am(i, e[i], t, 2 * i, 0, 1)),
      t.s = 0,
      t.clamp()
  }
  function D(t, r, n) {
    var s = t.abs();
    if (!(s.t <= 0)) {
      var o = this.abs();
      if (o.t < s.t)
        return null != r && r.fromInt(0),
          void (null != n && this.copyTo(n));
      null == n && (n = i());
      var a = i()
        , h = this.s
        , c = t.s
        , u = this.DB - m(s[s.t - 1]);
      u > 0 ? (s.lShiftTo(u, a),
        o.lShiftTo(u, n)) : (s.copyTo(a),
          o.copyTo(n));
      var f = a.t
        , l = a[f - 1];
      if (0 != l) {
        var p = l * (1 << this.F1) + (f > 1 ? a[f - 2] >> this.F2 : 0)
          , d = this.FV / p
          , g = (1 << this.F1) / p
          , y = 1 << this.F2
          , v = n.t
          , b = v - f
          , S = null == r ? i() : r;
        for (a.dlShiftTo(b, S),
          n.compareTo(S) >= 0 && (n[n.t++] = 1,
            n.subTo(S, n)),
          e.ONE.dlShiftTo(f, S),
          S.subTo(a, a); a.t < f;)
          a[a.t++] = 0;
        for (; --b >= 0;) {
          var T = n[--v] == l ? this.DM : Math.floor(n[v] * d + (n[v - 1] + y) * g);
          if ((n[v] += a.am(0, T, n, b, 0, f)) < T)
            for (a.dlShiftTo(b, S),
              n.subTo(S, n); n[v] < --T;)
              n.subTo(S, n)
        }
        null != r && (n.drShiftTo(f, r),
          h != c && e.ZERO.subTo(r, r)),
          n.t = f,
          n.clamp(),
          u > 0 && n.rShiftTo(u, n),
          0 > h && e.ZERO.subTo(n, n)
      }
    }
  }

  function J() {
    if (this.t < 1)
      return 0;
    var t = this[0];
    if (0 == (1 & t))
      return 0;
    var e = 3 & t;
    return e = e * (2 - (15 & t) * e) & 15,
      e = e * (2 - (255 & t) * e) & 255,
      e = e * (2 - ((65535 & t) * e & 65535)) & 65535,
      e = e * (2 - t * e % this.DV) % this.DV,
      e > 0 ? this.DV - e : -e
  }
  function I(t) {
    this.m = t,
      this.mp = t.invDigit(),
      this.mpl = 32767 & this.mp,
      this.mph = this.mp >> 15,
      this.um = (1 << t.DB - 15) - 1,
      this.mt2 = 2 * t.t
  }
  function N(t) {
    var r = i();
    return t.abs().dlShiftTo(this.m.t, r),
      r.divRemTo(this.m, null, r),
      t.s < 0 && r.compareTo(e.ZERO) > 0 && this.m.subTo(r, r),
      r
  }
  function M(t) {
    var e = i();
    return t.copyTo(e),
      this.reduce(e),
      e
  }
  function P(t) {
    for (; t.t <= this.mt2;)
      t[t.t++] = 0;
    for (var e = 0; e < this.m.t; ++e) {
      var i = 32767 & t[e]
        , r = i * this.mpl + ((i * this.mph + (t[e] >> 15) * this.mpl & this.um) << 15) & t.DM;
      for (i = e + this.m.t,
        t[i] += this.m.am(0, r, t, e, 0, this.m.t); t[i] >= t.DV;)
        t[i] -= t.DV,
          t[++i]++
    }
    t.clamp(),
      t.drShiftTo(this.m.t, t),
      t.compareTo(this.m) >= 0 && t.subTo(this.m, t)
  }
  function V(t, e) {
    t.squareTo(e),
      this.reduce(e)
  }
  function H(t, e, i) {
    t.multiplyTo(e, i),
      this.reduce(i)
  }
  function z() {
    return 0 == (this.t > 0 ? 1 & this[0] : this.s)
  }
  function L(t, r) {
    if (t > 4294967295 || 1 > t)
      return e.ONE;
    var n = i()
      , s = i()
      , o = r.convert(this)
      , a = m(t) - 1;
    for (o.copyTo(n); --a >= 0;)
      if (r.sqrTo(n, s),
        (t & 1 << a) > 0)
        r.mulTo(s, o, n);
      else {
        var h = n;
        n = s,
          s = h
      }
    return r.revert(n)
  }
  function q(t, e) {
    var i;
    return i = 256 > t || e.isEven() ? new A(e) : new I(e), this.exp(t, i)
  }

  function te() {
    this.i = 0,
      this.j = 0,
      this.S = new Array
  }
  function ee(t) {
    var e, i, r;
    for (e = 0; 256 > e; ++e)
      this.S[e] = e;
    for (i = 0,
      e = 0; 256 > e; ++e)
      i = i + this.S[e] + t[e % t.length] & 255,
        r = this.S[e],
        this.S[e] = this.S[i],
        this.S[i] = r;
    this.i = 0,
      this.j = 0
  }
  function ie() {
    var t;
    return this.i = this.i + 1 & 255,
      this.j = this.j + this.S[this.i] & 255,
      t = this.S[this.i],
      this.S[this.i] = this.S[this.j],
      this.S[this.j] = t,
      this.S[t + this.S[this.i] & 255]
  }
  function re() {
    return new te
  }
  function ne() {
    if (null == Oe) {
      for (Oe = re(); Ce > Ue;) {
        var t = Math.floor(65536 * Math.random());
        Ke[Ue++] = 255 & t
      }
      for (Oe.init(Ke),
        Ue = 0; Ue < Ke.length; ++Ue)
        Ke[Ue] = 0;
      Ue = 0
    }
    return Oe.next()
  }
  function se(t) {
    var e;
    for (e = 0; e < t.length; ++e)
      t[e] = ne()
  }
  function oe() { }
  function ae(t, i) {
    return new e(t, i)
  }
  function he(t, i) {
    if (i < t.length + 11)
      return console.error("Message too long for RSA"),
        null;
    for (var r = new Array, n = t.length - 1; n >= 0 && i > 0;) {
      var s = t.charCodeAt(n--);
      128 > s ? r[--i] = s : s > 127 && 2048 > s ? (r[--i] = 63 & s | 128,
        r[--i] = s >> 6 | 192) : (r[--i] = 63 & s | 128,
          r[--i] = s >> 6 & 63 | 128,
          r[--i] = s >> 12 | 224)
    }
    r[--i] = 0;
    for (var o = new oe, a = new Array; i > 2;) {
      for (a[0] = 0; 0 == a[0];)
        o.nextBytes(a);
      r[--i] = a[0]
    }
    return r[--i] = 2,
      r[--i] = 0,
      new e(r)
  }
  function ce() {
    this.n = null,
    this.e = 0,
    this.d = null,
    this.p = null,
    this.q = null,
    this.dmp1 = null,
    this.dmq1 = null,
    this.coeff = null
  }

  function fe(t) {
    return t.modPowInt(this.e, this.n)
  }
  function le(t) {
    var e = he(t, 2048 + 7 >> 3);
    if (null == e)
      return null;
    var i = this.doPublic(e);
    if (null == i)
      return null;
    var r = i.toString(16);
    return 0 == (1 & r.length) ? r : "0" + r
  }

  function be(t) {
    var e, i, r = "";
    for (e = 0; e + 3 <= t.length; e += 3)
      i = parseInt(t.substring(e, e + 3), 16),
        r += Me.charAt(i >> 6) + Me.charAt(63 & i);
    for (e + 1 == t.length ? (i = parseInt(t.substring(e, e + 1), 16),
      r += Me.charAt(i << 2)) : e + 2 == t.length && (i = parseInt(t.substring(e, e + 2), 16),
        r += Me.charAt(i >> 2) + Me.charAt((3 & i) << 4)); (3 & r.length) > 0;)
      r += Pe;
    return r
  }

  var Te, we = 0xdeadbeefcafe, Ee = 15715070 == (16777215 & we);
  Ee && "Microsoft Internet Explorer" == navigator.appName ? (e.prototype.am = n,
    Te = 30) : Ee && "Netscape" != navigator.appName ? (e.prototype.am = r,
      Te = 26) : (e.prototype.am = s,
        Te = 28),
    e.prototype.DB = Te,
    e.prototype.DM = (1 << Te) - 1,
    e.prototype.DV = 1 << Te;
  var xe = 52;
  e.prototype.FV = Math.pow(2, xe),
    e.prototype.F1 = xe - Te,
    e.prototype.F2 = 2 * Te - xe;
  var Re, Be, De = "0123456789abcdefghijklmnopqrstuvwxyz", _e = new Array;
  for (Re = "0".charCodeAt(0),
    Be = 0; 9 >= Be; ++Be)
    _e[Re++] = Be;
  for (Re = "a".charCodeAt(0),
    Be = 10; 36 > Be; ++Be)
    _e[Re++] = Be;
  for (Re = "A".charCodeAt(0),
    Be = 10; 36 > Be; ++Be)
    _e[Re++] = Be;

  I.prototype.convert = N,
  I.prototype.revert = M,
  I.prototype.reduce = P,
  I.prototype.mulTo = H,
  I.prototype.sqrTo = V,
  e.prototype.copyTo = h,
  e.prototype.fromInt = c,
  e.prototype.fromString = f,
  e.prototype.clamp = l,
  e.prototype.dlShiftTo = S,
  e.prototype.drShiftTo = T,
  e.prototype.lShiftTo = w,
  e.prototype.rShiftTo = E,
  e.prototype.subTo = x,
  e.prototype.multiplyTo = R,
  e.prototype.squareTo = B,
  e.prototype.divRemTo = D,
  e.prototype.invDigit = J,
  e.prototype.isEven = z,
  e.prototype.exp = L,
  e.prototype.toString = p,
  e.prototype.abs = g,
  e.prototype.compareTo = y,
  e.prototype.bitLength = b,
  e.prototype.modPowInt = q,
  e.ZERO = u(0),
  e.ONE = u(1);
  te.prototype.init = ee,
  te.prototype.next = ie;
  var Oe, Ke, Ue, Ce = 256;
  if (null == Ke) {
    Ke = new Array,
      Ue = 0;
    var Je;
    var Ie = new Uint32Array(256);
    for (window.crypto.getRandomValues(Ie),
      Je = 0; Je < Ie.length; ++Je)
      Ke[Ue++] = 255 & Ie[Je] 

  }
  oe.prototype.nextBytes = se,
  ce.prototype.doPublic = fe,
  ce.prototype.encrypt = le;
  var Me = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    , Pe = "="
    , Ve = Ve || {};
  Ve.env = Ve.env || {};
  Ve.env.parseUA = function (t) {
    var e, i = function () {}
    , r = navigator, n = {
      ie: 0,
      opera: 0,
      gecko: 0,
      webkit: 0,
      chrome: 126,
      mobile: null,
      air: 0,
      ipad: 0,
      iphone: 0,
      ipod: 0,
      ios: null,
      android: 0,
      webos: 0,
      webkit: 537.36,
      secure: true,
      os: "windows"
      }, s = t || navigator && navigator.userAgent, o = window && window.location, a = o && o.href;
    return n
  }
    ,
    Ve.env.ua = Ve.env.parseUA(),
    function (t) {
      "use strict";
      var e, i = {};
      i.decode = function (i) {
        var r;
        if (e === t) {
          var n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
            , s = "= \f\n\r\t \u2028\u2029";
          for (e = [],
            r = 0; 64 > r; ++r)
            e[n.charAt(r)] = r;
          for (r = 0; r < s.length; ++r)
            e[s.charAt(r)] = -1
        }
        var o = []
          , a = 0
          , h = 0;
        for (r = 0; r < i.length; ++r) {
          var c = i.charAt(r);
          if ("=" == c)
            break;
          if (c = e[c],
            -1 != c) {
            if (c === t)
              throw "Illegal character at offset " + r;
            a |= c,
              ++h >= 4 ? (o[o.length] = a >> 16,
                o[o.length] = a >> 8 & 255,
                o[o.length] = 255 & a,
                a = 0,
                h = 0) : a <<= 6
          }
        }
        switch (h) {
          case 1:
            throw "Base64 encoding incomplete: at least 2 bits missing";
          case 2:
            o[o.length] = a >> 10;
            break;
          case 3:
            o[o.length] = a >> 16,
              o[o.length] = a >> 8 & 255
        }
        return o
      }
        ,
        i.re = /-----BEGIN [^-]+-----([A-Za-z0-9+\/=\s]+)-----END [^-]+-----|begin-base64[^\n]+\n([A-Za-z0-9+\/=\s]+)====/,
        i.unarmor = function (t) {
          var e = i.re.exec(t);
          if (e)
            if (e[1])
              t = e[1];
            else {
              if (!e[2])
                throw "RegExp out of sync";
              t = e[2]
            }
          return i.decode(t)
        }
        ,
        window.Base64 = i
    }(),
    function (t) {
      "use strict";
      function e(t, i) {
        t instanceof e ? (this.enc = t.enc,
          this.pos = t.pos) : (this.enc = t,
            this.pos = i)
      }
      function i(t, e, i, r, n) {
        this.stream = t,
          this.header = e,
          this.length = i,
          this.tag = r,
          this.sub = n
      }
      e.prototype.get = function (e) {
        if (e === t && (e = this.pos++),
          e >= this.enc.length)
          throw "Requesting byte offset " + e + " on a stream of length " + this.enc.length;
        return this.enc[e]
      }
        ,
        e.prototype.hexDigits = "0123456789ABCDEF",
        e.prototype.hexByte = function (t) {
          return this.hexDigits.charAt(t >> 4 & 15) + this.hexDigits.charAt(15 & t)
        }
        ,
        e.prototype.hexDump = function (t, e, i) {
          for (var r = "", n = t; e > n; ++n)
            if (r += this.hexByte(this.get(n)),
              i !== !0)
              switch (15 & n) {
                case 7:
                  r += "  ";
                  break;
                case 15:
                  r += "\n";
                  break;
                default:
                  r += " "
              }
          return r
        }
        ,

        e.prototype.reTime = /^((?:1[89]|2\d)?\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/,

        i.prototype.reSeemsASCII = /^[ -~]+$/,

        i.prototype.posStart = function () {
          return this.stream.pos
        }
        ,

        i.prototype.posEnd = function () {
          return this.stream.pos + this.header + Math.abs(this.length)
        }
        ,

        i.prototype.toHexString = function () {
          return this.stream.hexDump(this.posStart(), this.posEnd(), !0)
        }
        ,
        i.decodeLength = function (t) {
          var e = t.get()
            , i = 127 & e;
          if (i == e)
            return i;
          if (i > 3)
            throw "Length over 24 bits not supported at position " + (t.pos - 1);
          if (0 === i)
            return -1;
          e = 0;
          for (var r = 0; i > r; ++r)
            e = e << 8 | t.get();
          return e
        }
        ,
        i.hasContent = function (t, r, n) {
          if (32 & t)
            return !0;
          if (3 > t || t > 4)
            return !1;
          var s = new e(n);
          3 == t && s.get();
          var o = s.get();
          if (o >> 6 & 1)
            return !1;
          try {
            var a = i.decodeLength(s);
            return s.pos - n.pos + a == r
          } catch (h) {
            return !1
          }
        }
        ,
        i.decode = function (t) {
          t instanceof e || (t = new e(t, 0));
          var r = new e(t)
            , n = t.get()
            , s = i.decodeLength(t)
            , o = t.pos - r.pos
            , a = null;
          if (i.hasContent(n, s, t)) {
            var h = t.pos;
            if (3 == n && t.get(),
              a = [],
              s >= 0) {
              for (var c = h + s; t.pos < c;)
                a[a.length] = i.decode(t);
              if (t.pos != c)
                throw "Content size is not correct for container starting at offset " + h
            } else
              try {
                for (; ;) {
                  var u = i.decode(t);
                  if (0 === u.tag)
                    break;
                  a[a.length] = u
                }
                s = h - t.pos
              } catch (f) {
                throw "Exception while decoding undefined length content: " + f
              }
          } else
            t.pos += s;
          return new i(r, o, s, n, a)
        }

        ,
        window.ASN1 = i
    }(),
    window.ASN1.prototype.getHexStringValue = function () {
      var t = this.toHexString()
        , e = 2 * this.header
        , i = 2 * this.length;
      return t.substr(e, i)
    }
    ,
    ce.prototype.parseKey = function (t) {
      try {
        var e = 0
          , i = 0
          , r = /^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/
          , n = r.test(t) ? Hex.decode(t) : window.Base64.unarmor(t)
          , s = window.ASN1.decode(n);
        if (9 === s.sub.length) {
          e = s.sub[1].getHexStringValue(),
          this.n = ae(e, 16),
          i = s.sub[2].getHexStringValue(),
          
          this.e = parseInt(i, 16);
          var o = s.sub[3].getHexStringValue();
          this.d = ae(o, 16);
          var a = s.sub[4].getHexStringValue();
          this.p = ae(a, 16);
          var h = s.sub[5].getHexStringValue();
          this.q = ae(h, 16);
          var c = s.sub[6].getHexStringValue();
          this.dmp1 = ae(c, 16);
          var u = s.sub[7].getHexStringValue();
          this.dmq1 = ae(u, 16);
          var f = s.sub[8].getHexStringValue();
          this.coeff = ae(f, 16)
        } else {
          // こっちへ行く
          // i = 010001
          if (2 !== s.sub.length)
            return !1;
          var l = s.sub[1]
            , p = l.sub[0];
          e = p.sub[0].getHexStringValue(),
          this.n = ae(e, 16),
          i = p.sub[1].getHexStringValue(),
          this.e = parseInt(i, 16)
        }
        return !0
      } catch (d) {
        return !1
      }
    }

    ;
  var Fe = function (t) {
    ce.call(this),
      t && ("string" == typeof t ? this.parseKey(t) : (this.hasPrivateKeyProperty(t) || this.hasPublicKeyProperty(t)) && this.parsePropertiesFrom(t))
  };
  Fe.prototype = new ce,
  Fe.prototype.constructor = Fe;
  var je = function (t) {
    t = t || {},
      this.default_key_size = parseInt(t.default_key_size) || 1024,
      this.default_public_exponent = t.default_public_exponent || "010001",
      this.log = t.log || !1,
      this.key = null
  };
  je.prototype.setKey = function (t) {
    this.log && this.key && console.warn("A key was already set, overriding existing."),
      this.key = new Fe(t)
  }
    ,

    je.prototype.setPublicKey = function (t) {
      this.setKey(t)
      return true
    }
    ,

    je.prototype.encrypt = function (t) {
      try {
        return be(this.getKey().encrypt(t))
      } catch (e) {
        //return !1
        return e
      }
    }
    ,
    je.prototype.getKey = function (t) {
      if (!this.key) {
        if (this.key = new Fe,
          t && "[object Function]" === {}.toString.call(t))
          return void this.key.generateAsync(this.default_key_size, this.default_public_exponent, t);
        this.key.generate(this.default_key_size, this.default_public_exponent)
      }
      return this.key
    }
    ,

    t.JSEncrypt = je
}(JSEncryptExports);

var JSEncrypt = JSEncryptExports.JSEncrypt;
var Multipayment = (function () {
  var program = {
    config: {
      api: {
        host: "https://p01.mul-pay.jp",
        context: "/ext/api/getToken"
      },
      version: "5",
      key: "",
      type: "",
      test: false,
      Pubkey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzJ6Ps4kEHAoUxWoTQM2YzvCnJrCpYo3kUKV6G8Pbl7NU1eAkF+rGKhGQVOqULbOa7bS+67txfK+p+WhYIVpxoCzkL9rFKKSb1qeW+phosmN3sXYo0IUa658adLvvpPzpwAqqTu+WNiANZrlstuCC2/dRBwGVl9i8W1pxJZbz2j2lPD7G/jxnqWgfDw+d/EXUAKazS/G6Dk+WoZkmTqkIzsJij5QX4xqmXbdyfsj6BXfmBS1RLAsngJ8bxtshRY9uQ6faSCuTaEF5l38Qh9HhXBoFB+MsOKQ4biUwgW/WaFc5KZ75VDFadrJtUn+5XOlY+iXIQhgdp/zewoZda0rGnQIDAQAB"
    },
    init: function (key) {
      this.config.key = key;
    },
    getToken: function (cardObj, callback) {
      callbackName = callback;

      var encryptedParam = this._createEncryptedParam(cardObj);
      var keySource = "iv=" + encryptedParam.iv + "&salt=" + encryptedParam.salt;
      var enc = new JSEncrypt();
      enc.setPublicKey(this.config.Pubkey);
      var encryptedKeySource = enc.encrypt(keySource);
      var signature = CryptoJS.SHA1(this.config.key + "|" + encryptedKeySource + "|" + encryptedParam.paramString + "|" + callbackName);
      var url = this.config.api.host + this.config.api.context + "?key=" + encodeURIComponent(encryptedKeySource) +
        "&callback=" + encodeURIComponent(callbackName) +
        "&publicKey=" + encodeURIComponent(this.config.key) +
        "&encrypted=" + encodeURIComponent(encryptedParam.paramString) +
        "&seal=" + encodeURIComponent(signature) +
        "&version=" + this.config.version;

      return url
    },
    _createEncryptedParam: function (cardObj) {
      var param = {
        iv: CryptoJS.lib.WordArray.random(16),
        salt: CryptoJS.lib.WordArray.random(16),
        paramString: ""
      };
      var cardData = [
        this._nvlToEmpty(cardObj.cardno),
        this._nvlToEmpty(cardObj.expire),
        this._nvlToEmpty(cardObj.securitycode),
        this._nvlToEmpty(cardObj.holdername),
        this._nvlToEmpty(cardObj.tokennumber)
      ].join("|");

      var key = CryptoJS.PBKDF2("SecretPassphrase", param.salt, {
        keySize: 4,
        iterations: 100
      });

      param.paramString = CryptoJS.AES.encrypt(cardData, key, {
        iv: param.iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString();

      return param;
    },
    _nvlToEmpty: function (value) {
      return value == null ? "" : value;
    }
  };
  return program;
})();

cardobj = {
  "cardno": "",
  "expire": "",
  "securitycode": "",
  "holdername": ""
}
Multipayment.init("9100763125609")
payment_url = Multipayment.getToken(cardobj, "onReceiveToken")
payment_url;