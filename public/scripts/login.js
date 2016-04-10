'use strict';
try {
    if (utils.isUndefined(angular)) {
        throw "Angular is undefined.";
    }

    app.controller('LoginCtrl', ['$scope', '$state', 'RequestService', function (scope, state, http) {
            scope.login = function (user) {
                http.send({
                    url: 'login',
                    method: 'post',
                    query: {
                        username: user.username,
                        password: user.password
                    },
                    complete: function (res) {
                        if (res.hasOwnProperty('user')) {
                            window.localStorage.setItem('user', res.user);
                            state.go('app.dashboard');
                        } else {
                            scope.message = res.message;
                        }
                    }
                });
            };
        }]);
} catch (err) {
    console.log(err);
}
