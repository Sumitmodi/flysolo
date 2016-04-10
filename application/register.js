var register = function (req, res, next) {

    /*
     copy the current request object.
     */
    this.req = req;

    /*
     Copy the current response object. Not really required though.
     */
    this.res = res;

};

register.prototype = {
    load: function () {

        /*
         Load the language library
         */
        var lang = this.loader.load.lang('en');

        /*
         The resopnse data
         */
        var data = {
            title: lang.register.doctitle,
            lang: lang
        };

        /*
         Load the response
         */
        this.loader.view('home/index', data);
    },
    process: function () {

        /*
         Collection of tables.
         */
        this.collections = this.loader.load.config('collections');

        /*
         The utilities library module.
         */
        var util = this.loader.load.library('flysolo').util;

        /*
         The db utility module.
         */
        var db = this.loader.load.library('database');
        this.db = new db(null, true);

        /*
         Save an instance of the current object in a local variable.
         */
        var obj = this;

        /*
         Remove any characters except a-z,0-9,.
         */
        this.req.body.username = util.clean_alphanum(this.req.body.username);

        /*
         Email validation regex
         */
        if (!util.validate_email(this.req.body.email)) {
            obj.loader.view('xhr/json', {title: 'Error', message: 'Email is invalid.'});
            return;
        }
        /*
         Check if username is less than 6 characters
         */
        if (this.req.body.username.length < 6) {
            obj.loader.view('xhr/json', {title: 'Error', message: 'Username length must be at least 6 characters.'});
            return;
        }

        /*
         Check if password is less than 6 characters
         */
        if (this.req.body.password_1.length < 6) {
            obj.loader.view('xhr/json', {title: 'Error', message: 'Password must be at least 6 characters.'});
            return;
        }

        /*
         Check if both passwords are equal or not
         */
        if (this.req.body.password_1 !== this.req.body.password_2) {
            obj.loader.view('xhr/json', {title: 'Error', message: 'Passwords do not match.'});
            return;
        }

        /*
         Check if email is already registered or not
         */
        this.db.init(function (db) {
            db.collection(obj.collections.col_users).find({email: obj.req.body.email}).limit(1).toArray(function (err, res) {

                /*
                 Some error was encountered.
                 */
                if (err) {
                    obj.loader.view('xhr/json', {title: 'Error', message: 'Some internal error occurred.'});
                    return;
                }

                /*
                 Email is already taken.
                 */
                if (res.length > 0) {
                    obj.loader.view('xhr/json', {title: 'Error', message: 'Email registered already.'});
                    return;
                }

                /*
                 Check is username is already taken.
                 */
                db.collection(obj.collections.col_users).find({username: obj.req.body.username}).limit(1).toArray(function (err, res) {

                    /*
                     Username is already taken.
                     */
                    if (res.length > 0) {
                        obj.loader.view('xhr/json', {title: 'Error', message: 'Username already taken.'});
                        return;
                    }

                    /*
                     Prepare the record to be inserted.
                     */
                    var insert = {
                        username: obj.req.body.username,
                        email: obj.req.body.email,
                        name: obj.req.body.name,
                        password: util.md5(obj.req.body.password_1)
                    };

                    /*
                     Insert a record
                     */
                    db.collection(obj.collections.col_users).save(insert, function (err, res) {

                        /*
                         User could not be created.
                         */
                        if (err) {
                            obj.loader.view('xhr/json', {title: 'Error', message: 'Some internal error occurred.'});
                            return;
                        }

                        /*
                         User registered successfully.
                         */
                        obj.loader.view('xhr/json', {
                            title: 'Success',
                            message: 'User registered successfully.',
                            code: 200
                        });
                    });

                });
            });
        });
    }
};

module.exports = register;