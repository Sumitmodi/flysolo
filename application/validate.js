var validation = function (req, res, next) {
    this.req = req;
    this.res = res;
    this.flysolo = require('../libraries/flysolo');

};
validation.prototype = {
    validate: function () {
        var param = this.req.params.parameter;
        var val = this.req.params.value;
        var method = 'validate' + this.flysolo.string.ucfirst(param);
        this.collections = this.loader.load.config('collections');
        if (this.flysolo.util.method_exists(this, method)) {
            var db = this.loader.load.library('database');
            var obj = this;
            this.db = new db(null, true);
            this.db.init(function (db) {
                obj[method](val, db);
            });
        } else {
            this.loader.error.error('Unknown request', {message: 'Unknown request.'}, 501);
        }
    },
    validateEmail: function (email, db) {
        var obj = this;

        if (!this.flysolo.util.validate_email(email)) {
            return obj.loader.view('xhr/json', {title: 'Error', message: 'Email is invalid.', code: 200});
        }

        db.collection(this.collections.col_users).
                find({email: email}).
                limit(1).
                toArray(function (err, res) {
                    if (err) {
                        obj.loader.view('xhr/json', {title: 'Error', message: 'Interval server error'});
                    }
                    if (!obj.req.xhr) {
                        if (res.length == 0) {
                            obj.loader.view('xhr/json', {message: 'Email available', code: 200});
                        } else {
                            obj.loader.view('xhr/json', {message: 'Email already taken', code: 200});
                        }
                    } else {
                        obj.loader.error.error('Access forbidden', {message: 'Access forbidden.'}, 403);
                    }
                });
    },
    validateUsername: function (username, db) {
        var obj = this;
        db.collection(this.collections.col_users).
                find({username: username}).
                limit(1).
                toArray(function (err, res) {
                    if (err) {
                        obj.loader.view('xhr/json', {title: 'Error', message: 'Interval server error'});
                    }
                    if (!obj.req.xhr) {
                        if (res.length == 0) {
                            obj.loader.view('xhr/json', {message: 'Username available', code: 200});
                        } else {
                            obj.loader.view('xhr/json', {message: 'Username already taken', code: 200});
                        }
                    } else {
                        obj.loader.error.error('Access forbidden', {message: 'Access forbidden.'}, 403);
                    }
                });
    }
};

module.exports = validation;