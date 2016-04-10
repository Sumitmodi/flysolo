var upload = function (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
};

upload.prototype = {
};

module.exports = upload;