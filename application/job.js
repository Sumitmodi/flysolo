var Job = function (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
};
/*
 Job definition
 */
Job.prototype = {
    init: function (method) {
        this.flysolo = this.loader.load.library('flysolo');
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
            return true;
        } else {
            this.loader.error.error('Invalid request.', 'The request was not understood.');
            return false;
        }
    },
    create: function () {
        /*
         Save an instance of the current object in a local variable.
         */
        var obj = this;
        this.db.init(function (db) {
            var date = new Date();
            var today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDay();
            var job = {
                title: obj.req.body.title,
                //created: today,
                created: date,
                user: 'ioesandeep',
                is_archive: 0
            };
            db.collection(obj.collections.col_jobs).insert(job, function (err, objects) {
                if (err) {
                    db.close();
                    obj.loader.error.show('error', err.message, 500);
                    return;
                }
                db.close();
                obj.loader.view('xhr/json', {
                    title: 'Success',
                    message: 'Job created successfully.',
                    code: 200,
                    job: job
                });
            }
            );
        });
    },
    update: function () {

    },
    remove: function (db) {
        var obj = this;
        this.db = new db(function (db) {
            db.collection(obj.collections.col_jobs).
                    findAndModify(
                            {_id: obj.req.body.job},
                    [['_id', 'asc']],
                            {},
                            {remove: true},
                    function (err, res) {
                        if (err) {
                            db.close();
                            obj.loader.error.error('Error', err.message, 500);
                            return;
                        }
                        db.close();
                        obj.loader.view('xhr/json', {title: 'Success', message: 'Job deleted successfully.', code: 200});
                    });
        });
    },
    archive: function (db) {
        var obj = this;
        this.db = new db(function (db) {
            var oid = require('mongodb').ObjectID;
            db.collection(obj.collections.col_jobs).
                    findAndModify(
                            {_id: (new oid(obj.req.body.job))},
                    [['_id', 'asc']],
                            {$set: {is_archive: 1}},
                    {},
                            function (err, res) {
                                if (err) {
                                    db.close();
                                    return obj.loader.error.error('Error', err.message, 500);
                                }

                                db.close();
                                obj.loader.view('xhr/json', {title: 'Success', message: 'Job archived successfully.', code: 200});
                            });
        });
    },
    list: function () {
        try {
            var obj = this;
            this.db.init(
                    function (db) {
                        db.collection(obj.collections.col_jobs).find({is_archive: 0}).toArray(function (err, res) {
                            if (err) {
                                db.close();
                                obj.loader.error.error('Error', err.message);
                                return;
                            }

                            db.close();
                            obj.res.status(200).json({
                                title: 'success',
                                message: 'Jobs loaded successfully.',
                                jobs: res,
                                code: 200
                            });
                        });
                    }
            );
        } catch (err) {
            console.log(err);
        }
    },
    details: function () {
        var obj = this;
        if (this.flysolo.util.isUndefined(obj.req.body.job)) {
            obj.loader.view('xhr/json', {
                title: 'Error',
                message: 'Job not selected.',
                code: 400
            });
            return;
        }
        var oid = require('mongodb').ObjectID;
        this.db.init(function (db) {
            db.collection(obj.collections.col_jobs).find({_id: (new oid(obj.req.body.job))}).toArray(function (err, res) {
                if (err) {
                    db.close();
                    obj.loader.error.error('Error', err.message);
                    return;
                }

                db.close();
                obj.res.send({
                    title: 'Success',
                    message: 'Job loaded successfully.',
                    job: res,
                    code: 200
                });
            });
        });
    }
};
module.exports = Job;