'use strict';
app.filter('time_passed_ago', function () {
    return function (input) {
        if (utils.isUndefined(input)) {
            return input;
        }

        io = new Date(input);

        if (!utils.isObject(io)) {
            input = new Date(input.replace('-', '/', 'g'));
        } else {
            input = io;
        }

        if (utils.date('Y', input) === utils.date('Y'))
        {
            if (utils.date('Y/m', input) === utils.date('Y/m'))
            {
                var d1 = new Date(utils.date('Y/m/d H:i:s', input));
                var d2 = new Date(utils.date('Y/m/d H:i:s'));
                var days = Math.round((d2 - d1) / ((1000 * 60 * 60 * 24)));

                if (days < 8) {
                    switch (days) {
                        case 0:
                            var secs = (d2.getTime() - d1.getTime()) / 1000;
                            var hr = Math.floor(secs / 3600);
                            secs = secs % 3600;
                            var mins = Math.floor(secs / 60);
                            secs = secs % 60;

                            if (hr > 0) {
                                if (hr === 1) {
                                    return lang.number[hr] + ' ' + lang.time.hr.toLowerCase() + ' ' + lang.i18.ago.toLowerCase();
                                }
                                return lang.number[hr] + ' ' + lang.time.hrs.toLowerCase() + ' ' + lang.i18.ago.toLowerCase();
                            }

                            if (mins > 0) {
                                if (mins === 1) {
                                    return lang.number[mins] + ' ' + lang.time.min.toLowerCase() + ' ' + lang.i18.ago.toLowerCase();
                                }
                                return lang.number[mins] + ' ' + lang.time.mins.toLowerCase() + ' ' + lang.i18.ago.toLowerCase();
                            }

                            if (secs === 1) {
                                return lang.number[secs] + ' ' + lang.time.sec.toLowerCase() + ' ' + lang.i18.ago.toLowerCase();
                            }

                            return lang.number[secs] + ' ' + lang.time.secs.toLowerCase() + ' ' + lang.i18.ago.toLowerCase();
                        case 1:
                            return lang.number[days] + ' ' + lang.time.day.toLowerCase() + ' ' + lang.i18.ago.toLowerCase();
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                            return lang.number[days] + ' ' + lang.time.days.toLowerCase() + ' ' + lang.i18.ago.toLowerCase();
                    }
                } else
                {
                    if (days / 7 === 0 || days / 7 === 1) {
                        return lang.time.last_week.toLowerCase();
                    }

                    if (days / 7 > 1) {
                        return lang.number[Math.floor(days / 7)] + ' ' + lang.time.weeks.toLowerCase() + ' ' + lang.i18.ago.toLowerCase();
                    }
                }
            }
            return utils.date('M d, h:i A', input);
        }
        return utils.date('Y/m/d H:i A', input);
    };
});

app.filter('getImageUrl', function () {
    return function (image) {
        return '/uploads/' + image;
    };
});

app.filter('getResourceUrl', function () {
    return function (resource) {
        return '/uploads/' + resource;
    };
});

app.filter('bytesToKb', function () {
    return function (bytes) {
        var b = parseInt(bytes);
        if (isNaN(b) || b <= 0) {
            return 0;
        }
        return Math.round(b / 1024, 2);
    };
});

app.filter('number_format', function () {
    return function (number, decimals, dec_point, thousands_sep) {
        number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
        var n = !isFinite(+number) ? 0 : +number, prec = !isFinite(+decimals) ? 0 : Math.abs(decimals), sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep, dec = (typeof dec_point === 'undefined') ? '.' : dec_point, s = '',
                toFixedFix = function (n, prec) {
                    var k = Math.pow(10, prec);
                    return '' + (Math.round(n * k) / k).toFixed(prec);
                };
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');

        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }

        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }

        return s.join(dec);
    };
});

app.filter("sanitize", function ($sce) {
    return function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };
});

app.filter('ucwords', function () {
    return function (inp) {
        return utils.ucwords(inp);
    };
})