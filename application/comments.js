var comments = function (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
};

comments.prototype = {
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
    list: function () {
        var timeline = this.req.body.timeline;
        var obj = this;
        this.db.init(function (db) {
            db.collection(obj.collections.col_comments).find({timeline_id: timeline}).toArray(function (err, res) {
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
                    comments: res
                });

            });
        });
    },
    add: function () {
        var obj = this;
        var comment = {
            comment: this.req.body.comment,
            timeline_id: this.req.body.timeline,
            user: this.req.session.logged.username,
            date_added: this.flysolo.date('Y/m/d H:i:s')
        };
        this.db.init(function (db) {
            db.collection(obj.collections.col_comments).save(comment, function (err, res) {
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
                    comment: res.ops[0],
                    message: 'Comment added to timeline post.'
                });

            });
        });
    },
    remove: function () {

    }
};

module.exports = comments;