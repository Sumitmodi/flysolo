var socket = function (server) {
    var io = require("socket.io")(server);
    var notifier = require('node-notifier');
    var emails;

    io.on('connection', function (sock) {
        console.log('Socket initiated.');

        sock.on('disconnect', function () {
            console.log('Socket closed.');
        });

        sock.on('check mail', function (user) {
            var Imap = require('imap');
            var config = require('../config/config');
            var imap = new Imap(config.imap.gmail);
            var MailParser = require("mailparser").MailParser;
            var flysolo = require('../libraries/flysolo');

            function openInbox(cb) {
                imap.openBox('INBOX', true, cb);
            }

            imap.once('ready', function () {

                notifier.notify({
                    title: 'Notice',
                    message: 'IMAP is ready.',
                    sound: true
                });

                openInbox(function (err, box) {
                    if (err) {
                        notifier.notify({
                            title: 'Error',
                            message: err.message || err,
                            sound: true
                        });
                        return;
                    }

                    //, ['FROM', 'always.sumit07@gmail.com']
                    imap.search(['UNSEEN', ['SINCE', 'September 3, 2015']], function (err, results) {


                        if (err) {
                            notifier.notify({
                                title: 'Error',
                                message: err.message || err,
                                sound: true
                            });
                            return;
                        }

                        if (results.length === 0) {
                            notifier.notify({
                                title: 'Notice',
                                message: 'No unread emails.',
                                sound: true
                            });
                            return;
                        }

                        var f = imap.fetch(results, {
                            bodies: ['HEADER.FIELDS (TO FROM SUBJECT DATE)', 'TEXT'],
                            markSeen: true,
                            struct: true
                        });

                        f.on('message', function (msg) {
                            msg.on('body', function (stream) {

                                var buffer = '', count = 0;

                                stream.on('data', function (chunk) {
                                    count += chunk.length;
                                    buffer += chunk.toString('utf8');
                                });

                                stream.once('end', function () {

                                    var mailparser = new MailParser();
                                    emails = {};

                                    mailparser.on("end", function (mail) {

                                        for (var key in mail) {
                                            emails[key] = mail[key];
                                        }

                                        if (emails.hasOwnProperty('from') && (emails.hasOwnProperty('html') || emails.hasOwnProperty('text'))) {
                                            notifier.notify({
                                                title: emails.from[0].address + ' sent an email',
                                                message: emails.subject,
                                                sound: true
                                            });
                                            io.emit('new email', emails);
                                        }
                                    });

                                    mailparser.write(buffer);
                                    mailparser.end();
                                });
                            });

                            msg.once('attributes', function (attrs) {
                                //console.log(attrs);
                            });

                            msg.once('end', function () {

                            });
                        });

                        f.once('error', function (err) {
                            notifier.notify({
                                title: 'Imap error',
                                message: err.message || err,
                                sound: true
                            });
                        });

                        f.once('end', function () {
                            imap.end();
                        });
                    });
                });

                imap.once('error', function (err) {
                    notifier.notify({
                        title: err.textCode || err.message || err,
                        message: 'Authentication failed',
                        sound: true
                    });
                });

                imap.once('end', function () {
                    notifier.notify({
                        title: 'Notice',
                        message: 'Connection ended.',
                        sound: true
                    });
                });

                imap.connect();
            });
        });
    });
};
module.exports = socket;
