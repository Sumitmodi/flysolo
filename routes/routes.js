var router = function () {
};
router.prototype = {
    init: function (app, routing) {
        this.app = app;
        this.routing = routing;
    },
    route: function () {
        var loader = require('../libraries/loader');
        //var subdomain = require('express-subdomain');

        function ensureAuthenticated(req, res, next) {
            if (req.isAuthenticated()) {
                return next();
            }
            res.redirect('/login');
        }

        this.app.get('/', function (req, res, next) {
            var index = loader.load.app('index');
            var ind = new index(req, res, next, loader);
        });

        this.app.get('/app', function (req, res, next) {
            var index = loader.load.app('index');
            var ind = new index(req, res, next, loader);
        });

        this.app.get('/app/:dashboard', function (req, res, next) {
            var index = loader.load.app('index');
            var ind = new index(req, res, next, loader);
        });

        this.app.get('/core', function (req, res, next) {
            var index = loader.load.app('index');
            var ind = new index(req, res, next, loader);
        });
        this.app.get('/core/:any', function (req, res, next) {
            var index = loader.load.app('index');
            var ind = new index(req, res, next, loader);
        });

        this.app.get('/login', function (req, res, next) {
            if (typeof req.query.type !== typeof undefined) {
                if (req.query.autoclose) {
                    req.session.autoclose = 1;
                } else {
                    req.session.autoclose = 0;
                }
                res.redirect('/login/' + req.query.type.toLowerCase());
                return;
            }

            var loginMod = loader.load.app('login');
            var login = new loginMod(req, res, next);
            loader.req = req;
            loader.res = res;
            loader.next = next;
            login.loader = loader;
            login.load();
        });

        this.app.post('/login', function (req, res, next) {
            var loginMod = loader.load.app('login');
            var login = new loginMod(req, res, next);
            loader.req = req;
            loader.res = res;
            loader.next = next;
            login.loader = loader;
            login.process();
        });

        this.app.get('/login/google', this.app.passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/plus.login'}));
        this.app.get('/login/success/google', this.app.passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

        this.app.get('/login/dropbox', this.app.passport.authenticate('dropbox-oauth2'));
        //successRedirect: '/',
        this.app.get('/login/success/dropbox', this.app.passport.authenticate('dropbox-oauth2', {
            failureRedirect: '/login'
        }), function (req, res, next) {
            req.session.user = req.user;
            res.redirect('/');
        });

        this.app.get('/login/logged', function (req, res, next) {
            var loginMod = loader.load.app('login');
            var login = new loginMod(req, res, next);
            loader.req = req;
            loader.res = res;
            loader.next = next;
            login.loader = loader;
            login.logged();
        });

        this.app.get('/register', function (req, res, next) {
            var regMod = loader.load.app('register');
            var reg = new regMod(req, res, next);
            loader.req = req;
            loader.res = res;
            loader.next = next;
            reg.loader = loader;
            reg.load();
        });

        this.app.post('/register', function (req, res, next) {
            var regMod = loader.load.app('register');
            var reg = new regMod(req, res, next);
            loader.req = req;
            loader.res = res;
            loader.next = next;
            reg.loader = loader;
            reg.process();
        });

        this.app.get('/validate/:parameter/:value', function (req, res, next) {
            var valMod = loader.load.app('validate');
            var validate = new valMod(req, res, next);
            loader.req = req;
            loader.res = res;
            loader.next = next;
            validate.loader = loader;
            validate.validate();
        });

        /*
         Logout
         */
        this.app.get('/logout', function (req, res, next) {
            req.session.destroy();
            if (res.xhr) {
                loader.res = res;
                loader.view('xhr/json', {title: 'success', message: 'Logged out successfully'});
            } else {
                //for the time being
                loader.res = res;
                loader.view('xhr/json', {title: 'success', message: 'Logged out successfully'});
            }
        });

        this.app.post('/logout', function (req, res, next) {
            req.session.destroy();
            if (res.xhr) {
                loader.res = res;
                loader.view('xhr/json', {title: 'success', message: 'Logged out successfully'});
            } else {
                //for the time being
                loader.res = res;
                loader.view('xhr/json', {title: 'success', message: 'Logged out successfully'});
                //res.redirect('/login');
            }
        });

        /*
         All the ajax requests will be handled here
         */
        this.app.post('/job/:method', function (req, res, next) {
            var module = loader.load.app('job');
            var job = new module(req, res, next);
            var method = req.params.method;
            loader.req = req;
            loader.res = res;
            loader.next = next;
            job.loader = loader;
            if (job.init(method)) {
                job[method]();
            }
        });


        /*
         * Timeline
         */
        this.app.post('/timeline/:action', function (req, res, next) {
            var module = loader.load.app('timeline');
            var timeline = new module(req, res, next);
            loader.req = req;
            loader.res = res;
            loader.next = next;
            timeline.loader = loader;
            timeline.init();
        });

        /*
         * Comments
         */
        this.app.post('/comments/:action', function (req, res, next) {
            var module = loader.load.app('comments');
            var comment = new module(req, res, next);
            loader.req = req;
            loader.res = res;
            loader.next = next;
            comment.loader = loader;
            comment.init();
        });

        /*
         * Participants
         */
        this.app.post('/participants/:action', function (req, res, next) {
            var module = loader.load.app('participants');
            var participant = new module(req, res, next);
            loader.req = req;
            loader.res = res;
            loader.next = next;
            participant.loader = loader;
            participant.init();
        });

        /*
         * File upload module
         */
        var multer = require('multer');
        var storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/uploads');
            },
            filename: function (req, file, cb) {
                var fs = require('fs');
                var flysolo = require('../libraries/flysolo.js');
                if (fs.existsSync('./public/uploads/' + file.originalname)) {
                    var name = flysolo.util.md5(flysolo.date('Y-m-d-')).substr(16, 8);
                    cb(null, name + '-' + file.originalname);
                } else {
                    cb(null, file.originalname);
                }
            }
        });
        var upload = multer({storage: storage});
        this.app.post('/upload/:type', upload.single('file'), function (req, res, next) {
            var type = req.params.type;
            res.status(200).send({
                type: type,
                file: req.file
            });
        });

        this.app.get('/session', function (req, res, next) {
            res.status(200).send({
                sess: req.session
            });
        });

        this.app.get('/dropbox/notify', function (req, res, next) {
            res.status(200).send(req.query.challenge);
        });

        this.app.get('*', function (req, res, next) {
            var index = loader.load.app('index');
            var ind = new index(req, res, next, loader);
        });


        //this.app.use(subdomain('appdev', this.routing));
    }
};
module.exports = router;