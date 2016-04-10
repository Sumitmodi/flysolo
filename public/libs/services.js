'use strict';

try {

    app.factory('store', ['$cacheFactory', function ($cacheFactory) {
        var store = function () {
            this.vault = {};
        }
        store.prototype = {
            init : function(vault_name){
                return $cacheFactory(vault_name.replace(/[^A-Za-z0-9_$]/,''));
            }
        };
        return new store();
    }]);

    app.factory('$modalInstance', [function () {
        var factory = function () {
            this.config = {};
            this.result = {};
            this.defer = {};
        };

        if (utils.isUndefined($)) {
            throw 'Modals service requires jQuery';
        }

        factory.prototype = {
            dismiss: function () {
                this.defer.reject();
                $('#' + this.config.id).fadeOut(200, function () {
                    $('div#flysolo-popup-container').html('');
                });
                this.config = {};
            },
            close: function (res) {
                this.defer.resolve(res);
                $('#' + this.config.id).fadeOut(400, function () {
                    $('div#flysolo-popup-container').html('');
                });
                this.config = {};
            }
        };
        return new factory();
    }]);

    app.factory('$modal', ['$templateCache', '$http', '$modalInstance', '$rootScope', '$controller', '$compile', '$q', function ($templateCache, $http, $modalInstance, $rootScope, $controller, $compile, $q) {

        return {
            open: function (config) {
                if (utils.isUndefined($)) {
                    throw 'Modals service requires jQuery';
                }
                config.id = config.id || 'job-add';
                var html = '<div id="flysolo-popup-container"></div>';

                if ($('div#flysolo-popup-container').length == 0) {
                    $(html).appendTo(document.body);
                }

                var defer = $q.defer();

                $modalInstance.config = config;
                $modalInstance.defer = defer;
                $modalInstance.result = defer.promise;

                $http.get(config.templateUrl, {cache: $templateCache}).then(function (res) {

                    $('#flysolo-popup-container').html(res.data);
                    $('#' + config.id).fadeIn();

                    var elem = angular.element(document.querySelector('#' + config.id));
                    var scope = $rootScope.$new();
                    var resolve = {
                        $scope: scope
                    };

                    if (config.hasOwnProperty('resolve')) {
                        for (var key in config.resolve) {
                            resolve[key] = config.resolve[key]();
                        }
                    }

                    var ctrl = $controller(config.controller, resolve);
                    elem.children().data('$ngControllerController', ctrl);
                    $compile(elem.contents())(scope);
                });

                return $modalInstance;
            }
        };
    }]);

    app.factory('RequestService', ['$http', function ($http) {
        var httpFactory = function () {
            this.options = {
                base: (utils.isUndefined(window.location.origin) ? window.location.protocol + '//' + window.location.host : window.location.origin) + '/',
                method: 'GET',
                query: '' || {},
                url: '', /* Appended url into the base url like /users, /page/about, etc.. */
                success: this.onSuccess,
                failure: this.onFailure
            };

            this.response = {
                data: '',
                status: '',
                text: ''
            };

            this.promise = $http;
        };

        httpFactory.prototype = {
            set: function (key, value) {
                if (utils.isUndefined(value)) {
                    for (var k in key) {
                        this.options[k] = key[k];
                    }
                } else {
                    this.options[key] = value;
                }
            },
            getOptions: function (key) {
                return this.options.hasOwnProperty(key) ? this.options[key] : false;
            },
            getResponse: function (key) {
                return this.response.hasOwnProperty(key) ? this.response[key] : false;
            },
            results: function (all) {
                return !utils.isUndefined(all) ? this.response : this.response.data;
            },
            setMethod: function (method) {
                method = utils.inArray(method.toUpperCase(), ['GET', 'POST']) ? method : 'GET';
                this.options.method = method;
            },
            setQuery: function (query) {
                this.options.query = query;
            },
            setUrl: function (url) {
                this.options.url = url;
            },
            makeRequest: function () {
                if (this.options.method.toLowerCase() === 'get') {
                    var append = '';
                    if (utils.isObject(this.options.query)) {
                        append += '?';
                        for (var key in this.options.query) {
                            append += key + '=' + this.options.query[key];
                            append += '&';
                        }
                        append.replace(/&+$/, '');
                    } else {
                        append = this.options.query;
                    }

                    this.promise = $http.get(this.options.base + this.options.url + (append == '?' ? '' : append));

                } else {
                    if (utils.isArrayOrObject(this.options.query)) {
                        $http.defaults.headers.post = {'Content-type': 'application/json'};
                    } else {
                        $http.defaults.headers.post = {'Content-type': 'application/x-www-form-urlencoded'};
                    }
                    this.promise = $http.post(this.options.base + this.options.url, this.options.query);
                }
                var obj = this;
                this.promise.then(function (data) {
                    obj.options['success'](data, obj);
                }, function (data) {
                    obj.options['failure'](data, obj);
                });

                if (obj.options.hasOwnProperty('complete')) {
                    this.promise.then(function () {
                        if (utils.isFunction(obj.options.complete)) {
                            var c = obj.options.complete;
                            c(obj.results());
                        }
                    });
                } else {
                    console.log(this.options);
                    return this.promise;
                }

            },
            send: function (config) {
                var inst = new httpFactory();
                inst.set(config);
                return inst.makeRequest();
            },
            onSuccess: function (data, obj) {
                obj.response.text = data.statusText;
                obj.response.data = data.data;
                obj.response.status = data.status;

                obj.options.url = '';
                obj.options.query = '' || {};
                obj.options.method = 'GET';
            },
            onFailure: function (data) {
                console.log(data);
                console.log('Request has failed.');
            },
            onComplete: function () {
                console.log('Request is complete.');
            }
        };

        return new httpFactory();

    }]);

} catch (err) {
    console.log(err);
}
