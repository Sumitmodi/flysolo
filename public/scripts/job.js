/*
 * 
 * @param {object} $scope The variable defining current scope of the page.
 * @param {object} $modal UI Bootstrap $modal directive for pop up dialogs.
 * @param object    $location   Similar to javascript location object.
 * @param object RequestService A service to make http requests.
 * @param object $state An object that represent the current state of the route/url.
 */
app.controller('JobCtrl', ['$scope', '$modal', '$location', 'RequestService', '$state', '$cookies', function ($scope, $modal, $location, http, $state, $cookies) {
    /*
     *
     * @var job The currently selected job
     */
    var job = $location.search().job;

    /*
     * @var $scope.current_user The currently logged in user
     */
    $scope.current_user = JSON.parse($cookies.current_user);

    /*
     * @var $scope.lang Variable to store all the language texts. Copied from the global lang variable.
     */
    $scope.lang = lang;

    /*
     * @var $scope.job The complete details of the selected job.
     */
    $scope.job = {};

    /*
     * @var $scope.jobs All the jobs posted.
     */
    $scope.jobs = [];

    /*
     * @var $scope.results Jobs search results.
     */
    $scope.results = [];

    /*
     * @var $scope.timeline The post being constructed.
     */
    $scope.timeline = {};

    /*
     * @var $scope.timelines A list of all the timeline posts.
     */
    $scope.timelines = [];

    /*
     * @var $scope.comment The current comment object.
     */
    $scope.comment = {};

    /*
     * @var $scope.fileUplaoder The file uploader object
     */
    $scope.fileUploader = null;

    /*
     * Initiate the socket
     */
    (function () {
        var socket = io();

        var emit = function () {
            socket.emit('check mail', $scope.current_user);
        };

        socket.on('new email', function (email) {
            console.log(email);
            if (email.hasOwnProperty('text')) {
                var index = email.text.indexOf('<html>');
                if (index > -1) {
                    email.text = email.text.substr(index, email.text.indexOf('</html>'));
                }
                email.text = email.text.replace(/=09/g, '');
                //email.text = email.text.replace(/=/gi, '');
                //email.text = email.text.replace(/&nbsp;/gi, '');
                email.text = email.text.substr(0, email.text.lastIndexOf('>'));
                email.text = email.text.substr(email.text.indexOf('<'), email.text.length - email.text.indexOf('<'));
            }
            $scope.timelines.unshift({
                email: email
            });
            $scope.$apply();
            //emit();
        });

        emit();
    })();

    $scope.isMeReceiver = function (email) {
        for (var key in email.to) {
            if ($scope.current_user.email === email.to[key].address) {
                return true;
            }
        }
        return false;
    };

    $scope.getSender = function (email, index) {
        return email.from[0][index];
    };

    /*
     Get all jobs list
     */
    http.send({
        method: 'get',
        url: 'session',
        complete: function (res) {
            console.log(res);
        }
    });

    /*
     Get all jobs list
     */
    http.send({
        method: 'post',
        url: 'job/list',
        complete: function (res) {
            if (res.code === 200) {
                if (utils.isUndefined('jobs')) {
                    $scope.no_jobs = true;
                } else {
                    $scope.jobs = res.jobs;
                }
            }
        }
    });

    /*
     Get selected job details
     */
    http.send({
        url: 'job/details',
        method: 'post',
        query: {
            job: job
        },
        complete: function (res) {
            if (res.code === 200) {
                if (utils.isUndefined('job')) {
                    $scope.no_job = true;
                } else {
                    $scope.job = res.job[0];
                }
            }
        }
    });

    /*
     *
     * @param object
     * @returns void
     * List all posts in the timeline
     */
    http.send({
        url: 'timeline/list',
        method: 'post',
        query: {
            job: job
        },
        complete: function (res) {
            if (res.code === 200) {
                if (res.hasOwnProperty('timeline')) {
                    $scope.timelines = res.timeline;
                    for (var i = 0; i < res.timeline.length; i++) {
                        $scope.fetchComments(i);
                    }
                }
            }
        }
    });

    /*
     * @param object
     * @returns void
     * List all the job participants
     */
    /*http.send({
     method: 'post',
     url: 'participants/list',
     query: {
     job: job
     },
     complete: function (res) {
     if (res.code === 200) {
     $scope.participants = res.participants;
     }
     }
     });*/

    /*
     * Open another job in the current tab.
     */
    $scope.openJob = function (job) {
        $state.go('app.job', {job: job._id});
    };

    /*
     * Search a job
     */
    $scope.searchJob = function (q) {
        $scope.results = [];
        if ($scope.jobs.length > 0) {
            for (var i = 0, job; i < $scope.jobs.length; i++) {
                job = $scope.jobs[i];
                if (job.title.toLowerCase().indexOf(q.toLowerCase()) > -1) {
                    $scope.results.push(job);
                }
            }
        }
    };

    /*
     * Display different timeline options when the textarea gains focus
     */
    $scope.showOpts = function () {
        $scope.display_options = true;
    };

    /*
     * Hide all timeline options when the textarea loses focus
     */
    $scope.hideOpts = function () {
        $scope.display_options = false;
    };

    /*
     * Add another post to the timeline
     */
    $scope.addTimelinePost = function (timeline) {
        var addPost = function () {
            /*
             * Construct the post query
             */
            var post = {
                job: job,
                timeline: {
                    text: timeline.text
                }
            };

            /*
             * If a file has to be uploaded to dropbox.
             */
            if (timeline.hasOwnProperty('is_dropbox')) {
                post.timeline.dropbox = timeline.is_dropbox;
            }

            /*
             * If files have been shared from dropbox
             */
            if (timeline.hasOwnProperty('is_dropbox')) {
                post.timeline.dropbox = timeline.is_dropbox;
            }

            /*
             * Just in case files have been added to the post
             */
            if (timeline.hasOwnProperty('files')) {
                post.timeline.files = timeline.files;
            }

            /*
             * If image has been uploaded
             */
            if (timeline.hasOwnProperty('image')) {
                post.timeline.image = timeline.image;
            }

            /*
             * If an event has been added
             */
            if (timeline.hasOwnProperty('event')) {
                post.timeline.event = timeline.event;
            }

            /*
             * If an estimate has been added
             */
            if (timeline.hasOwnProperty('estimate')) {
                post.timeline.estimate = timeline.estimate;
            }

            /*
             * If file has been shared
             */
            if ($scope.timeline.hasOwnProperty('dropboxShared')) {
                post.timeline.dropboxShared = [];
                for (var i = 0; i < $scope.timeline.dropboxShared.length; i++) {
                    var t = {};
                    for (var key in $scope.timeline.dropboxShared[i]) {
                        if (key.indexOf('$') === -1) {
                            t[key] = $scope.timeline.dropboxShared[i][key];
                        }
                    }
                    post.timeline.dropboxShared.push(t);
                }
            }

            /*
             * Send the request.
             */
            http.send({
                method: 'post',
                url: 'timeline/add',
                query: post,
                complete: function (res) {
                    /*
                     * Add the timeline to the top of the timeline posts.
                     */
                    $scope.timelines.unshift(res.timeline);
                    $scope.timeline = {};
                    if (!utils.isUndefined($scope.dropbox)) {
                        delete $scope.dropbox;
                    }
                }
            });
        };

        /*
         * If a file has been selected.
         */
        if (angular.isObject($scope.fileUploader)) {
            var uploader = $scope.fileUploader.uploader;
            var is_dropbox = $scope.fileUploader.is_dropbox;

            timeline.is_dropbox = is_dropbox;
            /*
             * Upload the first file in the queue. For the time being,
             * we support only one file at a time.
             */
            uploader.uploadItem(0);

            /*
             *
             * @param {object} fileItem The currently selected file instance.
             * @param {type} response The response from the server after the file has been uploaded.
             * @param {type} status The server status
             * @param {type} headers    The server status headers
             * @returns void
             */
            uploader.onCompleteItem = function (fileItem, response, status, headers) {
                /*
                 * Reset back the fileuploader object.
                 */
                $scope.fileUploader = null;
                var ext = /(?:\.([^.]+))?$/.exec(response.file.filename)[1];

                /*
                 * If the uploaded file is an image.
                 */
                if (['jpg', 'jpeg', 'png', 'gif', 'tiff'].indexOf(ext.toLowerCase()) > -1) {
                    timeline.image = {
                        name: response.file.filename
                    };
                } else {
                    timeline.files = {
                        name: response.file.filename
                    };
                }
                addPost();
            };
        } else {
            addPost();
        }
    };

    /*
     * Dropbox drop-ins sharer plugin function. Initiates sharer plugin.
     * @returns void
     */
    $scope.openDropboxSharer = function () {
        /*
         * Initialize the plugin
         */
        Dropbox.choose(options = {
            success: function (files) {
                console.log(files);
                if (files.length > 0) {
                    $scope.readingDimensions = false;
                    var image, ext, loaded = 0;
                    for (var key in files) {
                        ext = /(?:\.([^.]+))?$/.exec(files[key].name)[1];
                        if (['jpg', 'jpeg', 'png', 'gif', 'tiff'].indexOf(ext.toLowerCase()) > -1) {
                            image = new Image();
                            image.src = files[key].link;
                            image.onload = function () {
                                files[loaded].size = {
                                    width: this.naturalWidth,
                                    height: this.naturalHeight
                                };
                                ++loaded;
                                if (loaded === files.length) {
                                    $scope.timeline.dropboxShared = files;
                                    $scope.readingDimensions = false;
                                    $scope.$apply();
                                }
                            };
                            files[key].type = 'image';
                        } else {
                            ++loaded;
                            if (loaded === files.length) {
                                $scope.readingDimensions = false;
                            }
                            files[key].type = 'file';
                        }
                    }
                    $scope.dropbox = files;
                    $scope.$apply();
                }
            },
            cancel: function () {

            },
            linkType: "preview",
            multiselect: true
        });
    };

    /*
     * Returns the user who posted in timeline.
     * If its the currently logged in user or another user.
     * If it is current logged in user, return 'You' instead
     * of the username of the user.
     */
    $scope.getUser = function (t) {
        return t.username === $scope.current_user.username ? 'You' : t.username;
    };

    /*
     * @param object t
     * @returns string
     * Get the type of post, that has been posted in the timeline.
     */
    $scope.getType = function (t) {
        /*
         * If the post is an email
         */
        if (t.hasOwnProperty('email')) {
            return 'email';
        }

        /*
         * If the post is a file
         */
        if (t.hasOwnProperty('file')) {
            return 'file';
        }

        /*
         * If the post is an image.
         */
        if (t.hasOwnProperty('image')) {
            return 'image';
        }

        /*
         * If the post is a dropboxShared.
         */
        if (t.hasOwnProperty('dropboxShared')) {
            return 'dropboxShared';
        }

        /*
         * If the post is a dropbox.
         */
        if (t.hasOwnProperty('dropbox')) {
            return 'dropbox';
        }

        /*
         * If the post is an estimate
         */
        if (t.hasOwnProperty('estimate')) {
            return 'estimate';
        }

        /*
         * If the post is an event
         */
        if (t.hasOwnProperty('event')) {
            return 'event';
        }

        /*
         * If the post is a calendar.
         */
        if (t.hasOwnProperty('calendar')) {
            return 'calendar';
        }

        /*
         * If the post is a note.
         */
        if (t.hasOwnProperty('note')) {
            return 'note';
        }

        /*
         * If the post contains file.
         */
        if (t.hasOwnProperty('file')) {
            return 'file';
        }

        /*
         * Simply, the post is a simple text.
         */
        return 'text';
    };

    /*
     *
     * @param {object} t The current event
     * @returns {String|Boolean}
     * This function checks if the current event user in the current
     * user or a different member or any external person.
     */
    $scope.isInvitedOrCurrentUser = function (t) {
        var event = t.event.event || t.event;
        if (t.username === $scope.current_user.username) {
            return 'current_user';
        }

        for (var key in event.users) {
            if (event.users[key].email === $scope.current_user.email) {
                return 'member';
            }
        }
        return false;
    };

    $scope.recordEventAnswer = function (event, answer) {
        console.log(event);
    };

    $scope.getUserInfo = function () {
        return 'User name here';
    };

    $scope.initEventVars = function (t) {
        $scope.invitationType = $scope.isInvitedOrCurrentUser(t);
        $scope.current_event = t.event.event || t.event;
    };

    /*
     * Fetch all comments posted in a timeline post.
     */
    $scope.fetchComments = function (i) {
        /*
         * Check is the supplied timeline exists or not.
         * This is barely a case.
         */
        if (utils.isUndefined($scope.timelines[i])) {
            return;
        }

        /*
         * Determine the currently selected timeline post.
         */
        var t = $scope.timelines[i];

        /*
         * Make a request to fetch the comments posted in
         * the timeline post.
         */
        http.send({
            method: 'post', url: 'comments/list',
            query: {
                timeline: t._id
            },
            complete: function (res) {
                if (res.code === 200) {
                    /*
                     * Append the comments in the timeline variable
                     * instead of storing in a different variable
                     */
                    $scope.timelines[i].comments = res.comments;
                }
            }
        });
    };

    /* @pararm object comment   The comment
     * @param int i Index of the timeline post
     * Add a comment to a post.
     */
    $scope.addComment = function (comment, i) {
        /*
         * Makes a request to add the comment to the post.
         */
        http.send({
            method: 'post',
            url: 'comments/add',
            query: {
                timeline: $scope.timelines[i]._id,
                comment: comment.text
            },
            complete: function (res) {
                if (res.code === 200) {
                    /*
                     * If comments have been added to the post yet,
                     * create a new instance of comments objects.
                     */
                    if (utils.isUndefined($scope.timelines[i].comments)) {
                        $scope.timelines[i].comments = [];
                    }

                    /*                          * Push the currently added to the comments list.
                     */
                    $scope.timelines[i].comments.push(res.comment);
                    $scope.comment = {}, comment = '';
                }
            }
        });
    };

    /*
     * Open a timeline post in a solely new window.
     * The window is currently a popup dialog displaying
     * the post details with comments.
     */
    $scope.openTextinWindow = function (timeline) {
        $modal.open({
            templateUrl: 'timeline-pop.html',
            size: 'lg',
            controller: 'TimelinePopCtrl',
            resolve: {
                /*
                 * Supply the selected timeline post to the popup controller.
                 */
                timeline: function () {
                    return timeline;
                }
            }
        });
    };

    /*
     *
     * @param {String} The type of the modal window
     * @returns void
     * Opens a new modal window
     */
    $scope.openWindow = function (type) {
        var window_types = {
            /*
             * Job edit window modal
             */
            edit: {
                file: 'job-edit.html',
                controller: 'EditCtrl',
                id: 'job-form'
            },
            /*
             * Job archive modal
             */
            archive: {
                file: 'job-archive.html',
                controller: 'ArchiveCtrl',
                id: 'job-add'
            },
            /*
             * Job archive modal
             */
            delete: {
                file: 'job-delete.html',
                controller: 'DeleteCtrl',
                id: 'job-add'
            },
            /*
             * Timeline file upload modal
             */
            file: {
                file: 'job-file.html',
                controller: 'UploadCtrl',
                id: 'job-add'
            },
            /*
             * Timeline add event modal
             */
            event: {
                file: 'timeline-event.html',
                controller: 'EventCtrl',
                id: 'event-form'
            },
            /*
             * Timeline add estimate modal
             */
            estimate: {
                file: 'timeline-estimate.html',
                controller: 'EstimateCtrl',
                id: 'job-add'
            },
            /*
             * Add job participant
             */
            participant: {
                file: 'add-participant.html',
                controller: 'ParticipantCtrl',
                id: 'job-add'
            }
        };

        /*
         *
         * @type @exp;$modal@call;open
         * Open the modal window
         */
        var modalInstance = $modal.open({
            templateUrl: window_types[type].file,
            id: window_types[type].id,
            controller: window_types[type].controller,
            resolve: {
                /*
                 * Supply the job to the popup controller.
                 */
                job: function () {
                    return $scope.job;
                }
            }
        });

        /*
         * When the modal has been closed.
         * Resolve the result.
         */
        modalInstance.result.then(function (res) {
            if (angular.isObject(res)) {
                /*
                 * The returned result is an event.
                 */
                if (res.hasOwnProperty('event')) {
                    $scope.timeline.event = res.event;
                    /*
                     * The returned result is an estimate.
                     */
                } else if (res.hasOwnProperty('estimate')) {
                    $scope.timeline.estimate = res.estimate;
                } else {
                    /*
                     * By default, we assume a fileuploader object has been returned.
                     */
                    $scope.fileUploader = res;
                }
            }
        });
    };

    /*
     *
     * @param {object} e
     * @returns {Number}
     * Calculate the sum of an estimate.
     */
    $scope.getEstimateTotal = function (e) {
        var total = 0, c;
        for (var key in e) {
            c = parseFloat(e[key].value);
            if (isNaN(c) || utils.isEmpty(c)) {
                continue;
            }
            total += c;
        }
        return total;
    };
}])

    /*
     * @param {type} $scope The modal scope
     * @param {type} $modalInstance The modal instance
     * @param {type} job    The selected job
     * @returns {void}
     * Controller for the timeline popup window.
     */
    .controller('TimelinePopCtrl', function ($scope, $modalInstance, timeline) {
        $scope.timeline = timeline;

        /*
         * This function closes the popup window.
         */
        $scope.ok = function () {
            $modalInstance.close();
        };
    })

    /*
     * @param {type} $scope The modal scope
     * @param {type} $modalInstance The modal instance
     * @param {type} job    The selected job
     * @returns {void}
     * Job edit modal controller
     */
    .controller('EditCtrl', function ($scope, $modalInstance, job) {
        $scope.job = job;

        /*
         * This function closes the popup window.
         */
        $scope.ok = function () {
            $modalInstance.close();
        };
        /*
         * Close the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    })

    /*
     * @param {type} $scope The modal scope
     * @param {type} $modalInstance The modal instance
     * @param {type} job    The selected job
     * @returns {void}
     * Job archive modal controller
     */
    .controller('ArchiveCtrl', function ($scope, $modalInstance, job) {
        $scope.job = job;

        /*
         * This function closes the popup window.
         */
        $scope.ok = function () {
            $modalInstance.close();
        };
        /*
         * Close the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    })

    /*
     * @param {type} $scope The modal scope
     * @param {type} $modalInstance The modal instance
     * @param {type} job    The selected job
     * @returns {void}
     * Delete a job modal controller
     */
    .controller('DeleteCtrl', function ($scope, $modalInstance, job) {
        $scope.job = job;

        /*
         * This function closes the popup window.
         */
        $scope.ok = function () {
            $modalInstance.close();
        };
        /*
         * Close the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    })

    /*
     * @param {type} $scope The modal scope
     * @param {type} $modalInstance The modal instance
     * @param {type} job    The selected job
     * @param {type} FileUploader The fileuploader module/plugin
     * @returns {undefined}
     * File uploader modal controller
     */
    .controller('UploadCtrl', function ($scope, $modalInstance, job, FileUploader) {
        $scope.job = job;

        /*
         * If the submit button is disabled or not
         */
        $scope.disabled = true;

        /*
         * Show dropbox upload options
         */
        $scope.showDropboxOpts = false;

        /*
         * Show if authorization needs doing
         */
        $scope.showAuthorize = false;

        /*
         * Initiate the file uploade plugin.
         */
        $scope.uploader = new FileUploader({
            url: '/upload/timeline',
            autoUpload: false,
            removeAfterUpload: true
        });

        /*
         *
         * @param {object} fileItem The selecte file instance
         * @returns {void}
         * This function is called as soon as a file is selected.
         */
        $scope.uploader.onAfterAddingFile = function (fileItem) {
            $scope.disabled = false;
            $scope.showDropboxOpts = true;
        };

        /*
         *
         * @param {bool} data
         * @returns {undefined}
         * Display the authorization link.
         */
        $scope.dropboxUpload = function (data) {
            $scope.showAuthorize = data;
        };

        /*
         * Open the dropbox authorization window.
         * Performs an OAuth2 authorization.
         * @returns {undefined}
         */
        $scope.authorizeDropbox = function () {
            var w = window.open(base + '/login/?type=dropbox&autoclose=true', "window", "width=800, height=640");
        };

        /*
         * This function closes the popup window.
         */
        $scope.ok = function () {
            $modalInstance.close({uploader: $scope.uploader, is_dropbox: $scope.showAuthorize});
        };
        /*
         * Close the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    })
    .controller('EventCtrl', function ($scope, $modalInstance, job) {
        $scope.job = job;
        $scope.event = {
            users: [],
            title: '', start: {
                date: '',
                time: ''
            },
            end: {
                date: '',
                time: ''
            },
            location: '',
            description: ''
        };

        /*
         * @type Bool   Prevent/Allow form submission
         */
        $scope.submit = true;
        $scope.invite = '';

        /*
         *
         * @type RegExp Email validation regex
         */
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

        $scope.addEventUser = function (user) {
            $scope.invite = '';

            if (!re.test(user)) {
                $scope.message = lang.messages.data_not_email;
                return;
            }

            if (utils.isEmpty($scope.event.users)) {
                $scope.event.users.push({
                    email: user,
                    member: false
                });
                return;
            }

            for (var key in $scope.event.users) {
                if ($scope.event.users[key].email === user) {
                    return false;
                }
            }

            $scope.event.users.push({email: user, member: false});
        };

        $scope.findAndNotifyEmpty = function () {
            $scope.submit = true;
            if (utils.isEmpty($scope.event.title)) {
                $scope.submit = false;
                $scope.message = lang.messages.event_title_required;
            }

            if (utils.isEmpty($scope.event.start.date)) {
                $scope.submit = false;
                $scope.message = lang.messages.event_start_date_required;
            }

            if (utils.isEmpty($scope.event.end.date)) {
                $scope.submit = false;
                $scope.message = lang.messages.event_start_date_required;
            }

            if (utils.isEmpty($scope.event.location)) {
                $scope.submit = false;
                $scope.message = lang.messages.event_location_required;
            }
            if (utils.isEmpty($scope.event.description)) {
                $scope.submit = false;
                $scope.message = lang.messages.event_description_required;
            }

            var d1 = new Date($scope.event.start.date);
            var d2 = new Date($scope.event.end.date);

            if (isNaN(d1)) {
                $scope.submit = false;
                $scope.message = lang.messages.event_start_date_invalid;
                return;
            }

            if (isNaN(d2)) {
                $scope.submit = false;
                $scope.message = lang.messages.event_end_date_invalid;
                return;
            }

            if (d1 > d2) {
                $scope.submit = false;
                $scope.message = lang.messages.event_start_greater_end;
                return;
            }
        };

        $scope.emptyMessage = function () {
            $scope.message = '';
        };
        $scope.searchParticipants = function (user, $event) {
            if ($event.keyCode === 13) {
                return $scope.addEventUser(user);
            }

            if (utils.isUndefined($scope.job.participants)) {
                return;
            }

            $scope.searchedParticipants = [];
            for (var key in $scope.job.participants) {
                if ($scope.job.participants[key].indexOf(user) > -1) {
                    $scope.searchedParticipants.push($scope.job.participants[key]);
                }
            }
        };

        $scope.selectParticipant = function (email) {
            for (var key in $scope.event.users) {
                if ($scope.event.users[key].email === email) {
                    if ($scope.event.users[key].member === false) {
                        $scope.event.users[key].member = true;
                    }
                    return false;
                }
            }

            $scope.event.users.push({
                email: email,
                member: true
            });
        };

        /*
         * This function closes the popup window.
         */
        $scope.ok = function () {
            $scope.findAndNotifyEmpty();

            if ($scope.submit) {
                $modalInstance.close({event: $scope.event});
            }
        };

        /*
         * Close the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    })
    .controller('EstimateCtrl', function ($scope, $modalInstance, job) {
        $scope.job = job;
        $scope.message = '';
        $scope.estimate = {
            title: '',
            deadline: '',
            items: []
        };

        $scope.emptyMessage = function () {
            $scope.message = '';
        };

        $scope.pushEstimate = function (e) {
            if (utils.isEmpty(parseFloat(e.value)) || isNaN(parseFloat(e.value))) {
                $scope.message = 'Price is not valid.';
                return;
            }

            $scope.estimate.items.push({
                item: e.item,
                value: parseFloat(e.value)
            });

            $scope.current = {
                item: '',
                value: ''
            };
        };

        /*
         * This function closes the popup window.
         */
        $scope.ok = function () {
            $scope.estimate.items = JSON.parse(angular.toJson($scope.estimate.items));
            $modalInstance.close({
                estimate: $scope.estimate
            });
        };
        /*
         * Close the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    })
    .controller('ParticipantCtrl', function ($scope, store, $modalInstance, job, RequestService) {
        $scope.job = job;
        console.log(job);
        var s = store.init('users');
        if (!utils.isUndefined(s.get('participants'))) {
            $scope.users = s.get('participants');
        } else {
            RequestService.send({
                method: 'post',
                url: 'participants/available',
                query: {
                    job: $scope.job._id
                },
                complete: function (res) {
                    console.log(res);
                }
            });
        }
        /*
         * This function closes the popup window.
         */
        $scope.ok = function () {
            $modalInstance.close();
        };
        /*
         * Close the modal
         */
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    });
