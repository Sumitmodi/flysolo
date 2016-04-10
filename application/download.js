var download = function (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
};

download.prototype = {
    dropbox: function () {

    }
};

module.exports = download;