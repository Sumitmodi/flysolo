var login = function (req, res, next) {
    this.req = req;
    this.res = res;
};

login.prototype = {
    load: function () {
        var data = {
            title: 'Login'
        };
        this.res.render('home/index', data);
    },
    logged: function () {
        this.flysolo = this.loader.load.library('flysolo');

        if (this.flysolo.util.isUndefined(this.req.session.logged)) {
            this.loader.view('xhr/json', {title: 'Error', message: 'Login required.', code: 200});
            return;
        }

        this.loader.view('xhr/json', {
            title: 'Success',
            message: 'User logged in.',
            code: 200,
            user: this.req.session.logged
        });
    },
    process: function () {
        this.flysolo = this.loader.load.library('flysolo');

        if (!this.flysolo.util.isUndefined(this.req.session.logged)) {
            this.loader.view('xhr/json', {title: 'Logged', message: 'Logged in already.'});
            return;
        }

        this.collections = this.loader.load.config('collections');
        var db = this.loader.load.library('database');
        var user = {
            username: this.req.body.username,
            password: this.flysolo.util.md5(this.req.body.password)
        };

        var obj = this;
        this.db = new db(null, true);
        this.db.init(function (db) {
            db.collection(obj.collections.col_users).find(user).limit(1).toArray(function (err, res) {

                db.close();

                if (err) {
                    obj.loader.view('xhr/json', {title: 'Error', message: 'Some internal error occurred.'});
                    return;
                }

                if (res.length === 0) {
                    obj.loader.view('xhr/json', {title: 'Error', message: 'User does not exist.', code: 200});
                } else {

                    var user = {
                        username: res[0].username,
                        name: res[0].name,
                        email: res[0].email
                    };

                    obj.req.session.logged = user;
                    obj.loader.view('xhr/json', {
                        title: 'Success',
                        message: 'Logged in successfully.',
                        code: 200,
                        user: user
                    });
                }
            });
        });
    }
};

module.exports = login;