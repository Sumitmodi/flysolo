'use strict';
try {
    if (utils.isUndefined(app)) {
        throw 'Application has not been initialized yet!.';
    }

    app.directive('fileuploader', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.bind('click', function (e) {
                    angular.element(e.target).siblings('#upload').trigger('click');
                });
            }
        };
    });

    app.directive('autogrowheight', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var css;
                var elemCss = function () {
                    css = {
                        width: element.width(),
                        height: element.height(),
                        pad_left: element.css('padding-left'),
                        pad_right: element.css('padding-right'),
                        pad_top: element.css('padding-top'),
                        pad_bot: element.css('padding-bottom')
                    };
                    var actual_width = Math.round(parseFloat(css.width) - (parseFloat(css.pad_left) + parseFloat(css.pad_right)));
                    var actual_height = Math.round(parseFloat(css.height) - (parseFloat(css.pad_bot) + parseFloat(css.pad_top)));
                    return actual_width + ' ' + actual_height;
                };
                var getModelValue = function () {
                    if (typeof element[0].attributes['ng-model'] !== typeof undefined) {
                        var model = element[0].attributes['ng-model'].value;
                    }
                    if (typeof model !== typeof undefined) {
                        var mods = model.split('.');
                        var val = scope[mods[0]];
                        for (var i = 1; i < mods.length; i++) {
                            val = val[mods[i]];
                        }
                        return val;
                    } else {
                        if (typeof element[0].attributes['value'] !== typeof undefined) {
                            return element[0].attributes['value'].value;
                        }

                        return '';
                    }
                };
                element.bind('keyup', function () {
                    //var val = getModelValue();
                    var r = parseFloat(element[0].scrollHeight) + parseFloat(element.css("borderTopWidth")) + parseFloat(element.css("borderBottomWidth"));
                    while (parseFloat(element.height()) < r) {
                        element.height(parseFloat(element.height()) + 1);
                    }
                    console.log(parseFloat(element.height()));
                });
                element.bind('keypress', function () {
                    var r = parseFloat(element[0].scrollHeight) + parseFloat(element.css("borderTopWidth")) + parseFloat(element.css("borderBottomWidth"));
                    while (parseFloat(element.height()) < r) {
                        element.height(parseFloat(element.height()) + 1);
                    }
                    console.log(parseFloat(element.height()));
                });
            }
        };
    });

    app.directive('ngThumb', ['$window', function ($window) {
            var helper = {
                support: !!($window.FileReader && $window.CanvasRenderingContext2D),
                isFile: function (item) {
                    return angular.isObject(item) && item instanceof $window.File;
                },
                isImage: function (file) {
                    var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            };

            return {
                restrict: 'A',
                template: '<canvas/>',
                link: function (scope, element, attributes) {
                    if (!helper.support)
                        return;

                    var params = scope.$eval(attributes.ngThumb);

                    if (!helper.isFile(params.file))
                        return;
                    if (!helper.isImage(params.file))
                        return;

                    var canvas = element.find('canvas');
                    var reader = new FileReader();

                    reader.onload = onLoadFile;
                    reader.readAsDataURL(params.file);

                    function onLoadFile(event) {
                        var img = new Image();
                        img.onload = onLoadImage;
                        img.src = event.target.result;
                    }

                    function onLoadImage() {
                        var width = params.width || this.width / this.height * params.height;
                        var height = params.height || this.height / this.width * params.width;
                        canvas.attr({width: width, height: height});
                        canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                    }
                }
            };
        }]);
} catch (err) {
    console.log(err);
}