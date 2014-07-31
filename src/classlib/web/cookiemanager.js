/*

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return Cookies; });
    // CommonJS and Node.js module support.
    } else if (typeof exports !== 'undefined') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Cookies;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = Cookies;
    } else {
        window.Cookies = Cookies;
    }

*/

(function(undefined){

   var System = require('../system');
    var Web = require("../web");

   /*
      CookieManager
      based on Cookies.js 0.3.1, Copyright (c) 2013, Scott Hamper
   */

/* public */

   var CookieManager = Web.addClass(
      System.Class.extend("CookieManager", {
         enabled : false,
         defaults : {
            path: '/',
            domain: '',
            expires: '0',
            secure: ''
         },
         _document : null,
         _navigator : null,
         _cache : {},
         init : function () {
            // Allows for setter injection in unit tests
            this._document = undefined != context.document ? document : null;
            this._navigator = undefined != context.navigator ? navigator : null;

            this._getExtendedOptions({});

            this.enabled = this._areEnabled();
        },

        get : function (key) {
            if (!!this._document && this._cachedDocumentCookie !== this._document.cookie) {
                this._renewCache();
            }

            return this._cache[key];
        },

        set : function (key, value, options) {
            options = this._getExtendedOptions(options);
            options.expires = this._getExpiresDate(value === undefined ? -1 : options.expires);

            if (!!this._document) {
                this._document.cookie = this._generateCookieString(key, value, options);
            }

            return this;
        },

        expire : function (key, options) {
            return this.set(key, undefined, options);
        },

        _getExtendedOptions : function (options) {
            return {
                path: options && options.path || this.defaults.path,
                domain: options && options.domain || this.defaults.domain,
                expires: options && options.expires || this.defaults.expires,
                secure: options && options.secure !== undefined ?  options.secure : this.defaults.secure
            };
        },

        _isValidDate : function (date) {
            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
        },

        _getExpiresDate : function (expires, now) {
            now = now || new Date();
            switch (typeof expires) {
                case 'number': expires = new Date(now.getTime() + expires * 1000); break;
                case 'string': expires = new Date(expires); break;
            }

            if (expires && !this._isValidDate(expires)) {
                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
            }

            return expires;
        },

        _generateCookieString : function (key, value, options) {
            key = encodeURIComponent(key);
            value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
            options = options || {};

            var cookieString = key + '=' + value;
            cookieString += options.path ? ';path=' + options.path : '';
            cookieString += options.domain ? ';domain=' + options.domain : '';
            cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
            cookieString += options.secure ? ';secure' : '';

            return cookieString;
        },

        _getCookieObjectFromString : function (documentCookie) {
            var cookieObject = {};
            var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

            for (var i = 0; i < cookiesArray.length; i++) {
                var cookieKvp = this._getKeyValuePairFromCookieString(cookiesArray[i]);

                if (cookieObject[cookieKvp.key] === undefined) {
                    cookieObject[cookieKvp.key] = cookieKvp.value;
                }
            }

            return cookieObject;
        },

        _getKeyValuePairFromCookieString : function (cookieString) {
            // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
            var separatorIndex = cookieString.indexOf('=');

            // IE omits the "=" when the cookie value is an empty string
            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

            return {
                key: decodeURIComponent(cookieString.substr(0, separatorIndex)),
                value: decodeURIComponent(cookieString.substr(separatorIndex + 1))
            };
        },

        _renewCache : function () {
            if (!!this._document) {
                this._cache = this._getCookieObjectFromString(this._document.cookie);
                this._cachedDocumentCookie = this._document.cookie;
            }
        },

        _areEnabled : function () {
            return this.set('cookies.js', 1).get('cookies.js') === '1';
        }
      })
   );

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = CookieManager;
    } else {
        this.System = System;
    }

})();
