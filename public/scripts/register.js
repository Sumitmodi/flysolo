'use strict';
try {
    if (utils.isUndefined(angular)) {
        throw "Angular is undefined.";
    }

    app.controller('RegCtrl', ['$scope', '$state', 'RequestService', function (scope, state, http) {
            scope.register = function (user) {
                http.send({
                    url: 'register',
                    method: 'post',
                    query: {
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        password_1: user.password_1,
                        password_2: user.password_2
                    },
                    complete: function (res) {
                        if (res.title.toLowerCase() === 'success') {
                            return state.go('core.login');
                        }
                        scope.message = res.message;
                    }
                });
            };

            scope.checkEmail = function (email) {
                if (email === undefined) {
                    scope.message = 'Email is required.';
                    return;
                }

                http.send({
                    url: 'validate/email/' + email,
                    method: 'get',
                    complete: function (res) {
                        scope.message = res.message;
                    }
                });
            };

            scope.checkUsername = function (username) {
                if (username === undefined) {
                    scope.message = 'Username is required.';
                    return;
                }

                http.send({
                    url: 'validate/username/' + username,
                    method: 'get',
                    complete: function (res) {
                        scope.message = res.message;
                    }
                });
            };

        }]);
} catch (err) {
    console.log(err);
}
