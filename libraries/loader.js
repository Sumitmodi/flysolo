var loader = {
    load: {
        library: function (name) {
            try {
                return require('./' + name);
            } catch (err) {
                console.log(err);
            }
        },
        app: function (name) {
            try {
                return require('../application/' + name);
            } catch (err) {
                console.log(err);
            }
        },
        config: function (name) {
            try {
                return require('../config/' + name);
            } catch (err) {
                console.log(err);
            }
        },
        lang: function (name) {
            try {
                return require('../language/' + name);
            } catch (err) {
                console.log(err);
            }
        },
        module : function(name){
            return require(name);
        }
    },
    error: {
        _404: function (message, title) {

        },
        _400: function (message, title) {

        },
        _403: function (message, title) {
            loader.res.statusCode = 403;
            loader.res.statusMessage = 'OK';
        },
        show: function (message, status, title) {
            loader.res.statusCode = status || 500;
            loader.res.statusMessage = title || 'error';
            loader.res.send(message);
        },
        error: function (title, message, status) {
            loader.res.statusCode = status || 500;
            loader.res.statusMessage = title;
            loader.res.render('error/general', {message: message});
        }
    },
    view: function (file, data) {
        loader.res.statusCode = data.code || data.status || 200;
        loader.res.contentType = 'application/json';
        loader.res.render(file, {res: data});
    }
};

module.exports = loader;