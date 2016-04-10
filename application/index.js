var index = function (req, res, next, loader) {
    var data = {
        title: 'Home'
    };
    data.lang = loader.load.lang('en');
    if (req.session.autoclose === 1) {
        delete req.session.autoclose;
        res.render('home/autoclose');
    } else {
        res.render('home/index', data);
    }
};
module.exports = index;
