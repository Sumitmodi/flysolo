var participants = function (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
};

participants.prototype = {
    init: function () {
        var method = this.req.params.action;
        this.flysolo = this.loader.load.library('flysolo');
        this.lang = this.loader.load.lang('en');

        if (this.flysolo.util.method_exists(this, method)) {
            /*
             Collection of tables.
             */
            this.collections = this.loader.load.config('collections');
            /*
             The db utility module.
             */
            var db = this.loader.load.library('database');
            this.db = new db(null, true);
            this[method]();
        } else {
            this.loader.error.error('Invalid request.', 'The request was not understood.');
            return false;
        }
    },
    add: function () {
        var obj = this;
        var insert = {
            job_id: this.req.body.job,
            added_user: this.req.body.user,
            added_by: this.req.session.user.username,
            date_added: this.flysolo.date('Y/m/d H:i:s')
        };

        this.db.init(function (db) {
            db.collection(obj.collections.col_participants).save(insert, function (err, res) {
                if (err) {
                    obj.loader.view({
                        title: obj.lang.message.error,
                        message: err.message,
                        code: 500
                    });
                    return;
                }

                obj.res.json({
                    title: obj.lang.message.success,
                    code: 200,
                    participant: res.ops[0],
                    message: 'Participant added to job.'
                });
            });
        });
    },
    list: function () {
        var obj = this;
        this.db.init(function (db) {
            db.collection(obj.collections.col_participants).find({job_id: obj.req.body.job}).toArray(function (err, res) {
                if (err) {
                    obj.loader.view({
                        title: obj.lang.message.error,
                        message: err.message,
                        code: 500
                    });
                    return;
                }

                obj.res.json({
                    title: obj.lang.message.success,
                    message: 'Participants loaded successfully.',
                    participants: res,
                    code: 200
                });
            });
        });
    },
    available: function () {
        var obj = this;
        this.db.init(function (db) {
            db.collection(obj.collections.col_users).find({}).toArray(function (res, err) {
                if (err) {
                    obj.loader.view({
                        title: obj.lang.message.error,
                        message: err.message,
                        code: 500
                    });
                    return;
                }

                obj.res.status(200).json({
                    title: obj.lang.message.success,
                    message: 'Users loaded successfully.',
                    users: res,
                    code: 200
                });
            });
        });
    }
};

module.exports = participants;