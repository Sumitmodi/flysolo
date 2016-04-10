var db = function (callback, noinit) {
    this.db = {
//        user: 'flysolodbuser',
//        pass: 'Flying$$DB$$Solo',
//        db: 'flysoloapp',
        user: 'admin',
        pass: 'admin',
        db: 'flysolo',
        host: 'localhost',
        driver: 'mongodb',
        port: '27017'
    };

    this.url = this.createUrl();
    this.query = {};

    /*
     mongo client
     */
    this.client = require('mongodb').MongoClient;

    if (noinit !== true) {
        this.init(callback);
    }
};

db.prototype = {
    createUrl: function () {
        //this.db.user+':'+this.db.pass+'@' +
        return this.db.driver + '://' + this.db.host + ':' + this.db.port + '/' + this.db.db;
    },
    init: function (callback) {
        try {
            this.client.connect(this.url, function (err, db) {
                if (err) {
                    throw err;
                    return;
                }

                if ((typeof callback).toLowerCase() === 'function') {
                    callback(db);
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
};

module.exports = db;