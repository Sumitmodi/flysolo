'use strict';
/*
 This file is the entry point of the app.
 All the javascript and routing will be done here.
 */
try {

    /*
     Determine the base url for the page.
     */
    var base = typeof location.origin === 'undefined' ? location.origin = location.protocol + '//' + location.host : location.origin;
    /*
     Angular is required to run this app.
     */
    if (typeof angular == typeof undefined) {
        throw 'Angular is not defined.'
    }

    /*
     Module dependencies
     */
    var deps = [
        'ngAnimate',
        'ngTouch',
        'ngResource',
        'ngCookies',
        'oc.lazyLoad',
        'ui.router',
        'angularFileUpload'
    ];
    /*
     Name of the module (app).
     */
    var module = 'flysolo';
    /*
     Initialize the app
     */
    var app = angular.module(module, deps);
    if (!app) {
        throw 'Application cannot be initialized.';
    }

    app.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }]);
    app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/app/dashboard');
        $stateProvider

            /*
             The main app.
             */
            .state('app', {
                abstract: true,
                url: '/app',
                templateUrl: base + '/tpls/home/app.html',
                controller: 'AppCtrl',
                resolve: {
                    loadMyService: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'flysolo',
                            files: [base + '/libs/services.js', base + '/libs/directives.js', base + '/libs/filters.js', base + '/css/custom.css', base + '/js/socket.js']
                        });
                    }]
                }
            })

            /*
             Dashboard page
             */
            .state('app.dashboard', {
                url: '/dashboard',
                controller: 'HomeCtrl',
                templateUrl: base + '/tpls/home/home.html',
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'flysolo',
                            files: [base + '/scripts/home.js']
                        });
                    }]
                }
            })

            /*
             Job page
             */
            .state('app.job', {
                url: '/job?job',
                controller: 'JobCtrl',
                templateUrl: base + '/tpls/job/job.html',
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'flysolo',
                            files: [base + '/scripts/job.js']
                        });
                    }]
                }
            })

            /*
             Activities page
             */
            .state('app.activities', {
                url: '/activities',
                controller: 'HomeCtrl',
                templateUrl: base + '/tpls/home/home.html',
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'flysolo',
                            files: [base + '/scripts/home.js']
                        });
                    }]
                }
            })

            /*
             Profile page
             */
            .state('app.profile', {
                url: '/profile',
                controller: 'ProfileCtrl',
                templateUrl: base + '/tpls/profile/profile.html',
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'flysolo',
                            files: [base + '/scripts/profile.js']
                        });
                    }]
                }
            })

            /*
             The app core side. It ll contain login and registration pages.
             */
            .state('core', {
                abstract: true,
                url: '/core',
                template: '<div ui-view></div>',
                controller: 'CoreCtrl',
                resolve: {
                    loadMyService: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'flysolo',
                            files: [base + '/libs/services.js', base + '/css/custom.css']
                        });
                    }]
                }
            })

            /*
             Login page
             */
            .state('core.login', {
                url: '/login',
                controller: 'LoginCtrl',
                templateUrl: base + '/tpls/login/login.html',
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'flysolo',
                            files: [base + '/scripts/login.js']
                        });
                    }]
                }
            })

            /*
             Registration page
             */
            .state('core.register', {
                url: '/register',
                controller: 'RegCtrl',
                templateUrl: base + '/tpls/register/register.html',
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'flysolo',
                            files: [base + '/scripts/register.js']
                        });
                    }]
                }
            })

            /*
             Logout page
             */
            .state('core.logout', {
                url: '/logout',
                controller: 'LogoutCtrl',
            })
        /*
         Turn on html mode. So, # is not appended in the url
         */
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }]);
    /*
     The main controller.
     */
    app.controller('AppCtrl', function ($scope, $state, $http, $cookies) {
        $http.get(base + '/login/logged').then(function (data) {
            var res = data.data;
            if (res.title.toLowerCase() === 'success') {
                $scope.header = base + '/tpls/common/header.html';
                $scope.footer = base + '/tpls/common/footer.html';
                $scope.menu = base + '/tpls/common/menu.html';
                //store the current user
                $cookies.current_user = JSON.stringify(res.user);
            } else {
                $state.go('core.login');
            }
        });
    });

    /*
     Core entry (login,register,blah,blah,blah)
     */
    app.controller('CoreCtrl', function ($scope, $state, $http) {
        $http.get(base + '/login/logged').then(function (data) {
            var res = data.data;
            if (res.title.toLowerCase() === 'success') {
                $state.go('app.dashboard');
            }
        });
    });

    /*
     Not really required.
     */
    app.controller('LogoutCtrl', function ($scope, $http, $state) {
        $http.post(base + '/logout').then(function (data) {
            var res = data.data;
            if (res.title.toLowerCase() === 'success') {
                $state.go('core.login');
            } else {
                window.localStorage.removeItem('user');
                $state.go('app.dashboard');
            }
        });
    });

} catch (err) {
    console.log(err);
}