var utils = {
    isUndefined: function (variable) {
        return typeof variable === typeof undefined;
    },
    inArray: function (needle, haystack) {
        var length = haystack.length;
        for (var i = 0; i < length; i++) {
            if (haystack[i] == needle)
                return true;
        }
        return false;
    },
    isArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    isNull: function (data) {
        return data === null;
    },
    type: function (data) {
        return typeof data;
    },
    isObject: function (obj) {
        if (utils.isNull(obj)) {
            return false;
        }
        return utils.type(obj).toLowerCase() === 'object';
    },
    isObjectOrArray: function (obj) {
        return utils.isArray(obj) || utils.isObject(obj);
    },
    isArrayOrObject: function (obj) {
        return utils.isObjectOrArray(obj);
    },
    isString: function (data) {
        return utils.type(data).toLowerCase() === 'string';
    },
    isNum: function (data) {
        return !isNaN(parseFloat(data)) && isFinite(data);
    },
    isFunction: function (data) {
        return utils.type(data).toLowerCase() === 'function';
    },
    ucwords: function (str) {
        return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
            return $1.toUpperCase();
        });

    },
    ucfirst: function (str) {
        str += '';
        var f = str.charAt(0).toUpperCase();
        return f + str.substr(1);
    },
    isEmpty: function (data) {
        return utils.isNull(data) || data === '' || data.length === 0;
    },
    //imported from phpjs.org
    date: function (format, timestamp) {
        var that = this;
        var jsdate, f;
        var txt_words = [
            'Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur',
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        var formatChr = /\\?(.?)/gi;
        var formatChrCb = function (t, s) {
            return f[t] ? f[t]() : s;
        };
        var _pad = function (n, c) {
            n = String(n);
            while (n.length < c) {
                n = '0' + n;
            }
            return n;
        };
        f = {
            d: function () {
                return _pad(f.j(), 2);
            },
            D: function () {
                return f.l()
                        .slice(0, 3);
            },
            j: function () {
                return jsdate.getDate();
            },
            l: function () {
                return txt_words[f.w()] + 'day';
            },
            N: function () {
                return f.w() || 7;
            },
            S: function () {
                var j = f.j();
                var i = j % 10;
                if (i <= 3 && parseInt((j % 100) / 10, 10) == 1) {
                    i = 0;
                }
                return ['st', 'nd', 'rd'][i - 1] || 'th';
            },
            w: function () {
                return jsdate.getDay();
            },
            z: function () {
                var a = new Date(f.Y(), f.n() - 1, f.j());
                var b = new Date(f.Y(), 0, 1);
                return Math.round((a - b) / 864e5);
            },
            W: function () {
                var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3);
                var b = new Date(a.getFullYear(), 0, 4);
                return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
            },
            F: function () {
                return txt_words[6 + f.n()];
            },
            m: function () {
                return _pad(f.n(), 2);
            },
            M: function () {
                return f.F().slice(0, 3);
            },
            n: function () {
                return jsdate.getMonth() + 1;
            },
            t: function () {
                return (new Date(f.Y(), f.n(), 0))
                        .getDate();
            },
            L: function () {
                var j = f.Y();
                return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0;
            },
            o: function () {
                var n = f.n();
                var W = f.W();
                var Y = f.Y();
                return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
            },
            Y: function () {
                return jsdate.getFullYear();
            },
            y: function () {
                return f.Y().toString().slice(-2);
            },
            a: function () {
                return jsdate.getHours() > 11 ? 'pm' : 'am';
            },
            A: function () {
                return f.a()
                        .toUpperCase();
            },
            B: function () {
                var H = jsdate.getUTCHours() * 36e2;
                var i = jsdate.getUTCMinutes() * 60;
                var s = jsdate.getUTCSeconds();
                return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
            },
            g: function () {
                return f.G() % 12 || 12;
            },
            G: function () {
                return jsdate.getHours();
            },
            h: function () {
                return _pad(f.g(), 2);
            },
            H: function () {
                return _pad(f.G(), 2);
            },
            i: function () {
                return _pad(jsdate.getMinutes(), 2);
            },
            s: function () {
                return _pad(jsdate.getSeconds(), 2);
            },
            u: function () {
                return _pad(jsdate.getMilliseconds() * 1000, 6);
            },
            e: function () {
                throw 'Not supported (see source code of date() for timezone on how to add support)';
            },
            I: function () {
                var a = new Date(f.Y(), 0);
                var c = Date.UTC(f.Y(), 0);
                var b = new Date(f.Y(), 6);
                var d = Date.UTC(f.Y(), 6);
                return ((a - c) !== (b - d)) ? 1 : 0;
            },
            O: function () {
                var tzo = jsdate.getTimezoneOffset();
                var a = Math.abs(tzo);
                return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4);
            },
            P: function () {
                var O = f.O();
                return (O.substr(0, 3) + ':' + O.substr(3, 2));
            },
            T: function () {
                return 'UTC';
            },
            Z: function () {
                return -jsdate.getTimezoneOffset() * 60;
            },
            c: function () {
                return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb);
            },
            r: function () {
                return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
            },
            U: function () {
                return jsdate / 1000 | 0;
            }
        };
        this.date = function (format, timestamp) {
            that = this;
            jsdate = (timestamp === undefined ? new Date() :
                    (timestamp instanceof Date) ? new Date(timestamp) :
                    new Date(timestamp * 1000)
                    );
            return format.replace(formatChr, formatChrCb);
        };
        return this.date(format, timestamp);
    }
};