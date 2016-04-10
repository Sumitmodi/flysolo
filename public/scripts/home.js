app.controller('HomeCtrl', ['$scope', '$modal', '$state', 'RequestService', function ($scope, $modal, $state, http) {
        $scope.modalvisible = false;
        $scope.jobs = [];
        http.send({
            method: 'post',
            url: 'job/list',
            complete: function (res) {
                if (res.code === 200) {
                    $scope.jobs = res.jobs;
                }
            }
        });
        $scope.openJob = function (job) {
            $state.go('app.job', {job: job._id});
        };
        $scope.confirmDelete = function (key) {
            $scope.selected_job = key;
            var modalInstance = $modal.open({
                templateUrl: 'deletemodal.html',
                controller: 'ModalCtrl',
                size: 'sm',
                resolve: {
                    job: function () {
                        return $scope.jobs[key];
                    }
                }
            });
            modalInstance.result.then(function (ans) {
                if (utils.isUndefined(ans)) {
                    return false;
                }
                if (ans === 1) {
                    $scope.deleteJob($scope.selected_job);
                }
            });
        };
        $scope.confirmArchive = function (key) {
            $scope.selected_job = key;
            var modalInstance = $modal.open({
                templateUrl: 'archivemodal.html',
                controller: 'ModalCtrl',
                size: 'sm',
                resolve: {
                    job: function () {
                        return $scope.jobs[key];
                    }
                }
            });
            modalInstance.result.then(function (ans) {
                if (utils.isUndefined(ans)) {
                    return false;
                }
                if (ans === 1) {
                    $scope.archiveJob($scope.selected_job);
                }
            });
        };

        $scope.open = function () {
            var modalInstance = $modal.open({
                templateUrl: 'jobmodal.html',
                controller: 'ModalCtrl',
                id: 'job-add',
                resolve: {
                    job: function () {
                        return $scope.job;
                    }
                }
            });
            modalInstance.result.then(function (job) {
                if (utils.isUndefined(job)) {
                    console.log('Please enter a job name.');
                    return;
                }
                $scope.createJob(job);
            });
        };
        $scope.createJob = function (job) {
            http.send({
                method: 'post',
                url: 'job/create',
                query: {
                    title: job.name
                },
                complete: function (res) {
                    if (res.code === 200) {
                        //job was created successfully.
                        $scope.jobs.push(res.job);
                    }
                }
            });
        };
        $scope.deleteJob = function (key) {
            var job = $scope.jobs[key];
            http.send({
                method: 'post',
                url: 'job/remove',
                query: {
                    job: job._id
                },
                complete: function () {

                    if (res.code === 200) {
                        $scope.jobs.splice(key, 1);
                        //notify job was deleted
                    }
                }
            });
        };
        $scope.archiveJob = function (key) {
            var job = $scope.jobs[key];
            http.send({
                method: 'post',
                url: 'job/archive',
                query: {
                    job: job._id
                },
                complete: function (res) {
                    if (res.code === 200) {
                        //notify job was archived
                    }
                }
            });
        };
    }])
        .controller('ModalCtrl', function ($scope, $modalInstance,job) {
            $scope.message = '';
            if (!utils.isUndefined(job)) {
                $scope.job = job;
            }
            $scope.ok = function (job) {
                if (utils.isUndefined(job)) {
                    $scope.message = 'Please enter a job name.';
                    return;
                }
                $modalInstance.close($scope.job);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            $scope.yes = function (ans) {
                $modalInstance.close(ans);
            };
        });