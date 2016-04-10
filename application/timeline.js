'use strict';
/*
 * 
 * @param object req
 * @param object res
 * @param function next
 * @returns void
 */
var timeline = function (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;

    //variables used by the application
    this.services = ['files', 'email', 'dropbox', 'calendar', 'events', 'estimate'];
};

timeline.prototype = {
    /*
     * 
     * @returns {Boolean}
     */
    init: function () {
        var method = this.req.params.action;
        this.flysolo = this.loader.load.library('flysolo');
        this.lang = this.loader.load.lang('en');
        this.config = this.loader.load.config('config');

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
    /*
     * Loads timeline for any selected job.
     */
    list: function () {
        var obj = this;
        this.db.init(function (db) {
            db.collection(obj.collections.col_timeline).find({job_id: obj.req.body.job}).sort({_id: -1}).toArray(function (err, res) {
                if (err) {
                    obj.loader.view('xhr/json', {
                        title: 'Error',
                        message: err.message,
                        code: 500
                    });
                    return;
                }

                obj.res.status(200).json({
                    title: 'Success',
                    message: 'Timeline loaded successfully',
                    timeline: res,
                    code: 200
                });
            });
        });
    },
    add: function () {
        //check if the job exists or not
        var job = this.req.body.job;

        //backup the current to use inside callbacks
        var obj = this;

        this.db.init(function (db) {
            var oid = obj.loader.load.module('mongodb').ObjectID;

            //search the job
            db.collection(obj.collections.col_jobs).find({_id: (new oid(job))}).toArray(function (err, res) {
                if (err) {
                    obj.loader.view('xhr/json', {
                        title: 'Error',
                        message: err.message,
                        code: 500
                    });
                    return;
                }

                if (res.length === 1) {
                    //determine what has been posted in the timeline
                    //possible postings are:- files,dropbox,estimate,calendar,email,events,image. 
                    var t = obj.req.body.timeline;
                    if (!obj.flysolo.util.isUndefined(t.files)) {
                        obj.addTextTimeline(db, 'files');
                    } /*else if (!obj.flysolo.util.isUndefined(t.dropbox)) {
                     obj.addTextTimeline(db, 'dropbox');
                     }*/
                    else if (!obj.flysolo.util.isUndefined(t.estimate)) {
                        obj.addTextTimeline(db, 'estimate');
                    }
                    else if (!obj.flysolo.util.isUndefined(t.event)) {
                        obj.addTextTimeline(db, 'event');
                    } else if (!obj.flysolo.util.isUndefined(t.image)) {
                        obj.addTextTimeline(db, 'image');
                    } else {
                        obj.addTextTimeline(db);
                    }
                } else if (res.length === 0) {
                    //weird more than one job with the same id were found. This never happens.
                    obj.loader.view('xhr/json', {
                        title: 'Error',
                        message: 'Selected job does not exist.',
                        code: 400
                    });
                    return;
                }
            });
        });
    },
    addTextTimeline: function (db, type) {
        try {
            var insert = {
                job_id: this.req.body.job,
                username: this.req.session.logged.username,
                date_added: this.flysolo.date('Y/m/d H:i:s')
            };
            var obj = this;
            var notifier = require('node-notifier');

            if (!this.flysolo.util.isUndefined(this.req.body.timeline.text)) {
                insert.post = this.req.body.timeline.text;
            }

            if (!this.flysolo.util.isUndefined(type) && type.toLowerCase() === 'image') {
                insert.image = this.req.body.timeline.image.name;
            }

            if (!this.flysolo.util.isUndefined(type) && type.toLowerCase() === 'files') {
                insert.file = this.req.body.timeline.files.name;
            }

            if (!this.flysolo.util.isUndefined(type) && type.toLowerCase() === 'estimate') {
                insert.estimate = this.req.body.timeline.estimate;
            }

            if (!this.flysolo.util.isUndefined(type) && type.toLowerCase() === 'event') {
                insert.event = this.req.body.timeline.event;

                /*
                 * We ll need to send email invites to people.
                 */
                var nodemailer = require('nodemailer');

                var transport = nodemailer.createTransport({
                    service: this.flysolo.string.ucfirst(this.config.mail.service),
                    auth: {
                        user: this.config.mail.smtp.username,
                        pass: this.config.mail.smtp.password
                    }
                });

                this.res.render('email/event_invite', {user: this.req.session.logged, event: insert.event, lang: this.lang}, function (err, html) {
                    if (err) {
                        notifier.notify({
                            title: 'Event invitation email error',
                            message: err.message || err,
                            sound: true
                        });
                        return;
                        //throw err || err.message;
                    }

                    var receivers = [], from = obj.req.session.logged.name + '<' + obj.req.session.logged.email + '>';
                    for (var key in insert.event.users) {
                        receivers.push(insert.event.users[key].email);
                    }

                    var emailOpts = {
                        from: from,
                        to: receivers.join(','),
                        subject: obj.lang.email.subject.event_invitation,
                        html: html
                    };

                    transport.sendMail(emailOpts, function (err, response) {
                        if (err) {
                            notifier.notify({
                                title: 'Event invitation email error',
                                message: err.message || err,
                                sound: true
                            });
                            return;
                            //throw err;
                        }
                        console.log(response);
                        notifier.notify({
                            title: 'Event invitation email error',
                            message: response,
                            sound: true
                        });
                        //success
                    });
                });

            }

            if (!this.flysolo.util.isUndefined(this.req.body.timeline.dropboxShared)) {
                insert.dropboxShared = this.req.body.timeline.dropboxShared;
            }

            /*
             if (!this.flysolo.util.isUndefined(type) && type.toLowerCase() === 'dropbox' && this.req.body.timeline.dropbox !== false) {
             insert.dropbox = {};
             var file;
             if (!this.flysolo.util.isUndefined(this.req.body.timeline.image)) {
             insert.dropbox.image = this.req.body.timeline.image.name;
             file = this.req.body.timeline.image.name;
             } else if (!this.flysolo.util.isUndefined(this.req.body.timeline.files)) {
             insert.dropbox.file = this.req.body.timeline.files.name;
             file = this.req.body.timeline.files.name;
             } else {
             throw 'Dropbox expects only files to be selected.';
             }
             
             var Dropbox = require('dropbox');
             var config = this.loader.load.config('config');
             
             //we assume the client is logged in.
             var auth = {
             key: config.dropbox.apikey,
             secret: config.dropbox.appSecret,
             token: this.req.session.user.token,
             uid: this.req.session.user.profile.id,
             maxApiServer: 0
             };
             var client = new Dropbox.Client(auth);
             if (client.isAuthenticated()) {
             var fs = require('fs');
             fs.readFile('./public/uploads/' + file, function (err, data) {
             if (err) {
             throw err;
             }
             
             client.writeFile(file, data, function (err, reply) {
             if (err) {
             throw err;
             }
             obj.res.status(200).json(reply);
             });
             });
             } else {
             throw 'Client is not authenticated.';
             }
             }
             */

            db.collection(this.collections.col_timeline).save(insert, function (err, res) {
                if (err) {
                    if (!obj.loader.hasOwnProperty('res')) {
                        obj.loader.res = this.res;
                    }

                    obj.loader.view('xhr/json', {
                        title: 'Error',
                        message: 'Interval server error',
                        code: 500
                    });

                    return;
                }
                obj.res.json({
                    title: 'Success',
                    message: 'Post added to timeline',
                    code: 200,
                    timeline: res.ops[0]
                });
            });
        } catch (err) {
            this.loader.view('xhr/json', {
                title: 'Error',
                message: err.message || err,
                code: 500
            });
        }
    }
};

module.exports = timeline;