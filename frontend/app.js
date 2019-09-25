// App Logic Here

/*
    Sort Function
    sort((a, b) => {
        var keyA = new Date(a.timestamp),
            keyB = new Date(b.timestamp);
        // Compare the 2 dates
        if(keyA < keyB) return 1;
        if(keyA > keyB) return -1;
        return 0;
    })
*/

const sortDescByOrder = (a, b) => {
    var keyA = a.order,
        keyB = b.order;
    // Compare the 2 order
    if(keyA < keyB) return 1;
    if(keyA > keyB) return -1;
    return 0;
}

const sortDesc = (a, b) => {
    var keyA = new Date(a.timestamp),
        keyB = new Date(b.timestamp);
    // Compare the 2 dates
    if(keyA < keyB) return 1;
    if(keyA > keyB) return -1;
    return 0;
}

const sortDescByMaxTm = (a, b) => {
    var keyA = new Date(a.maxTm),
        keyB = new Date(b.maxTm);
    // Compare the 2 dates
    if(keyA < keyB) return 1;
    if(keyA > keyB) return -1;
    return 0;
}

var app = angular.module('forumApp', [])

app.service('ForumApiService', function($http) {
    api = {}

    api.endpoint = "http://localhost:8082/api"

    api.setJWTToken = function(jwt_token) {
        // $http.defaults.headers.Authorization = 'Bearer ' + jwt_token;
        $http.defaults.headers.common.Authorization = 'Bearer ' + jwt_token;
    }

    api.unsetJWTToken = function() {
        // $http.defaults.headers.Authorization = '';
        $http.defaults.headers.common.Authorization = '';
    }

    api.getTopics = function(forum_id=null) {
        if(!forum_id) {
            return $http.get(api.endpoint + '/topics')
        } else {
            return $http.get(api.endpoint + '/topics/' + forum_id)
        }
    }

    api.getForums = function() {
        return $http.get(api.endpoint + '/forums')
    }

    api.addNewTopic = function(topic) {
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
        
        return $http.post(api.endpoint + '/topic', JSON.stringify(topic))
    }

    api.editTopic = function(topic_id, topic) {
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'

        return $http.put(api.endpoint + '/topic/' + topic_id, JSON.stringify(topic))
    }

    api.replyToTopic = function(parent_topic_id, topic) {
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'

        return $http.post(api.endpoint + '/topic/reply/' + parent_topic_id, JSON.stringify(topic))
    }

    api.login = function(user) {
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
        
        return $http.post(api.endpoint + '/login', JSON.stringify(user))
    }

    api.registerNewUser = function(user) {
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
        
        return $http.post(api.endpoint + '/user/register', JSON.stringify(user))
    }

    api.editUser = function(_id, user) {
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
        
        return $http.put(api.endpoint + '/user/edit/' + _id, JSON.stringify(user))
    }

    return api
})

app.service('ModalService', function() {
    var modals = []; // array of modals on the page
    var service = {};

    service.Add = Add;
    service.Remove = Remove;
    service.Open = Open;
    service.Close = Close;

    return service;

    function Add(modal) {
        // add modal to array of active modals
        modals.push(modal);
    }

    function Remove(id) {
        // remove modal from array of active modals
        var modalToRemove = _.findWhere(modals, { id: id });
        modals = _.without(modals, modalToRemove);
    }

    function Open(id) {
        // open modal specified by id
        var modal = _.findWhere(modals, { id: id });

        modal.open();
    }

    function Close(id) {
        // close modal specified by id
        var modal = _.findWhere(modals, { id: id });

        modal.close();
    }
})

app.service('UserService', function() {
    var current_user = {}; // array of modals on the page
    var service = {};
    var jwt_token = '';
    var is_logged = false;

    service.saveNewUser = function(user, _jwt_token) {
        current_user = user
        jwt_token = _jwt_token

        window.localStorage.setItem('user', JSON.stringify(current_user))
        window.localStorage.setItem('token', jwt_token)

        is_logged = true
    }

    service.getUserAndToken = function() {
        return {
            user: JSON.parse(window.localStorage.getItem('user')),
            token: window.localStorage.getItem('token')
        }
    }

    service.isLogged = function() {
        return (window.localStorage['user'] || false) && (window.localStorage['token'] || false)
    }

    service.isAdmin = function() {
        return this.isLogged() && this.getUserAndToken().user.is_admin
    }

    service.deleteUser = function() {
        window.localStorage.removeItem('user')
        window.localStorage.removeItem('token')
    }

    return service;
})

app.directive('ckeditor', function Directive($rootScope) {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
            console.log('ckeditor element: ', element)

            var editorOptions;
            if (attr.ckeditor === 'minimal') {
                // minimal editor
                editorOptions = {
                    height: 100,
                    toolbar: [
                        { name: 'basic', items: ['Bold', 'Italic', 'Underline'] },
                        { name: 'links', items: ['Link', 'Unlink'] },
                        { name: 'tools', items: ['Maximize'] },
                        { name: 'document', items: ['Source'] },
                    ],
                    removePlugins: 'elementspath',
                    resize_enabled: false
                };
            } else {
                // regular editor
                editorOptions = {
                    filebrowserImageUploadUrl: 'http://localhost:8081/upload',
                    removeButtons: 'About,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Save,CreateDiv,Language,BidiLtr,BidiRtl,Flash,Iframe,addFile,Styles',
                    extraPlugins: 'simpleuploads,imagesfromword'
                };
            }

            // enable ckeditor
            var ckeditor = CKEDITOR.replace( element[0].id );

            // update ngModel on change
            ckeditor.on('change', function () {
                ngModel.$setViewValue(this.getData());
            });
        }
    };
})

app.directive('modal', function(ModalService) {
    return {
        link: function (scope, element, attrs) {
            // ensure id attribute exists
            if (!attrs.id) {
                console.error('modal must have an id');
                return;
            }

            // move element to bottom of page (just before </body>) so it can be displayed above everything else
            element.appendTo('body');

            // close modal on background click
            element.on('click', function (e) {
                var target = $(e.target);
                if (!target.closest('.modal-body').length) {
                    scope.$evalAsync(Close);
                }
            });

            // add self (this modal instance) to the modal service so it's accessible from controllers
            var modal = {
                id: attrs.id,
                open: Open,
                close: Close
            };

            ModalService.Add(modal);
        
            // remove self from modal service when directive is destroyed
            scope.$on('$destroy', function() {
                ModalService.Remove(attrs.id);
                element.remove();
            });                

            // open modal
            function Open() {
                element.show();
                $('body').addClass('modal-open');
            }

            // close modal
            function Close() {
                element.hide();
                $('body').removeClass('modal-open');
            }
        }
    }
})

app.filter('safeHtml', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
});

var forumController = app.controller(
    'ForumController',
    ['$scope', '$window', 'UserService', 'ModalService', 'ForumApiService', function($scope, $window, UserService, ModalService, ForumApiService) {
    var forum = this;

    console.log('$scope: ', $scope)
    console.log('ModalService: ', ModalService)
    console.log('ForumApiService: ', ForumApiService)

    forum.topic = {
        parent: 0,
        level: 1,
        title:'',
        subtitle: '',
        text: "",
        timestamp: 0,
        maxTm: 0,
        topics: [],
        user: ''
    }

    forum.newUser = {
        login: '',
        username: '',
        password: '',
        email: ''
    }

    $scope._isLogged = false
    $scope._isAdmin = false
    $scope.current_user = {}
    $scope.jwt_token = ''
    $scope.current_page = 0
    $scope.current_topic = {};

    $scope.isLogged = function() {
        // Check if user in local storage ecc...
        // return $scope._isLogged

        if(UserService.isLogged()) {
            let userData = UserService.getUserAndToken()

            $scope.current_user = userData.user
            $scope.jwt_token = userData.token

            $scope._isLogged = true

            $scope._isAdmin = UserService.isAdmin()
            // console.log('isAdmin: ', $scope._isAdmin)

            // console.log('userData isLogged(): ', userData)

            ForumApiService.setJWTToken(userData.token)

            return true
        }

        return false
    }

    forum.goToNextPage = function() {
       return forum.incPage(1)
    }

    forum.goToPreviousPage = function() {
        return forum.incPage(-1)
    }

    forum.incPage = function(inc) {
        if($scope.current_page >= 0) {
            $scope.current_page += inc
        } else {
            $scope.current_page = 0
        }

        console.log('current_page: ', $scope.current_page)
    }

    forum.replyToTopic = function(parentTopic, newTopic) {
        newTopic.timestamp = Date.now()
        newTopic.maxTm = newTopic.timestamp
        newTopic.level = parentTopic.level || 0
        newTopic.level++
        newTopic.parent = '0'
        newTopic.user = $scope.current_user._id
        newTopic.forum = $scope.currentForum._id

        // parentTopic.topics.push(newTopic)

        // $scope.loadTopics()

        // TODO Save to database

        ForumApiService.replyToTopic(parentTopic._id, newTopic)
            .then(res => {
                console.log('replyToTopic res: ', res)

                $scope.loadTopics()
            })
            .catch(err => console.log(err))
    }
 
    forum.addNewTopic = function(topic) {
        topic.timestamp = Date.now()
        topic.maxTm = topic.timestamp
        topic.level = 1
        topic.parent = '0'
        topic.user = $scope.current_user._id
        topic.forum = $scope.currentForum._id

        console.log('New Topic is: ', topic)

        ForumApiService.addNewTopic(topic)
            .then(response => {
                $scope.apiResponse = response.data

                $scope.loadTopics()
            })
    }

    forum.login = function(user) {
        console.log('Asking login for user: ', user)

        ForumApiService.login(user)
            .then(response => {
                console.log('Login Response: ', response)

                if(response.data.success == true) {
                    console.log('Login Success !!!')

                    alert('Login Success !!!')

                    // $scope.loginSuccessMsg = 'Login Success !!!'

                    // $window.localstorage

                    UserService.saveNewUser(response.data.data.user, response.data.data.token)

                    $scope.closeModal('login-modal')

                    ForumApiService.setJWTToken(response.data.data.token)

                    /*$scope.current_user = response.data.data.user
                    $scope.jwt_token = response.data.data.token

                    $scope._isLogged = true*/
                } else {
                    console.log('Login Failed: ' + response.data.data.msg)

                    $scope.loginErrorMsg = response.data.data.msg
                }
            })
    }

    forum.registerNewUser = function(newUser) {
        ForumApiService.registerNewUser(newUser)
            .then(res => {
                console.log('Register New User Response: ', res)

                if(res.data.success === true) {
                    console.log('Register Success')

                    $scope.registerErrorMsg = undefined
                    $scope.registerSuccessMsg = 'Utente Creato, prego fare il login'
                } else {
                    console.log('Register Failed')

                    if (res.data.data.msg.errmsg.includes('duplicate key')) {
                        $scope.registerSuccessMsg = undefined
                        $scope.registerErrorMsg = 'Registrazione Fallita: Email o Utente già in uso'
                    } else {
                        $scope.registerSuccessMsg = undefined
                        $scope.registerErrorMsg = 'Registrazione Fallita: ' + res.data.data.msg.errmsg
                    }
                }
            })
            .catch(err => console.log('Register New User Error: ', err))
    }

    forum.editUser = function(newUser) {
        console.log('Editing user', $scope.current_user)

        if(newUser.email == '') {
            delete newUser['email']
        }

        if(newUser.password == '') {
            delete newUser['password']
        }

        if(newUser.username == '') {
            delete newUser['username']
        }

        if(newUser.login == '') {
            delete newUser['login']
        }

        console.log('With: ', newUser)

        ForumApiService.editUser($scope.current_user._id, newUser)
            .then(res => {
                console.log('Edit User Response: ', res)
            })
            .catch(err => console.log(err))
    }

    forum.doLogout = function() {
        console.log('Asking login for user: ', $scope.current_user)

        UserService.deleteUser()

        $scope.current_user = {}
        $scope.jwt_token = ''

        $scope._isLogged = false
    }

    $scope.loadForum = function($event, $index, f) {
        console.log('loadForum $index: ', $index)
        console.log('loadForum, ev: ', $event, f)

        $scope.forumList.map(item => item.is_active = false)

        f.is_active = true;

        $scope.currentForum = f

        console.log('New Current Forum is: ', $scope.currentForum)

        $scope.loadTopics()

        /*if($($event.target).hasClass('forum-tab-active')) {
            return;
        }

        $($event.target).addClass('forum-tab-active')*/
    }

    $scope.loadTopics = function() {

        ForumApiService.getTopics($scope.currentForum._id)
            .then(response => {
                $scope.topics = response.data
                $scope.sortAll($scope.topics)
            })
    }
    
    // Do Onload Things...
    $scope.onload = function() {
        ForumApiService.getForums()
            .then(response => {
                $scope.forumList = response.data
                // sortDescByOrder($scope.forumList)

                $scope.currentForum = $scope.forumList[0]
                console.log('Current Forum is: ', $scope.currentForum)

                $scope.loadTopics()
            })
    }

    $scope.isAdmin = function() {
        return $scope.current_user.is_admin
    }

    $scope.goToAdminArea = function() {
        $window.location.href = '/admin'
    }

    // Sort Topics Per Relevance (Latest Active to less Active)
    $scope.sortAll = function(topics) {

        $scope.sortAllDesc(topics, sortDesc)

        /*for(let i = 0; i < topics.length; i++) {

            if(topics[i].topics.length > 0) {
                console.log('Descending: ', topics[i])

                topics[i].maxTm = $scope.setMaxTm(topics[i].topics, topics[i].timestamp)
            } else {
                console.log('Has no child: ', topics[i])
                topics[i].maxTm = topics[i].timestamp
            }
        }*/

        $scope.setMaxTm(topics, topics[0].timestamp)

        for(let i = 0; i < topics.length; i++) {

            if(topics[i].topics.length > 0) {
                $scope.sortAllDesc(topics[i].topics, sortDescByMaxTm)
                topics[i].maxTm = topics[i].topics[0].maxTm
            }

        }

        topics.sort(sortDescByMaxTm)
        
    }

    $scope.setMaxTm = function(topics, maxTm=0) {

        console.log('MaxTm is: ', maxTm)

        for(let i = 0; i < topics.length; i++) {

            if(topics[i].timestamp > maxTm) {
                maxTm = topics[i].timestamp
            }

            if(topics[i].topics.length > 0) {

                console.log('-- Descending: ', topics[i])

                topics[i].maxTm = $scope.setMaxTm(topics[i].topics, maxTm)
            } else {
                topics[i].maxTm = topics[i].timestamp
            }

        }

        return maxTm
    }

    $scope.sortAllDesc = function(topics, fn) {
        topics.sort(fn)

        topics.forEach((el, i) => {
            if(el.topics.length > 0) {
                // console.log('topic has children', el.topics)

                $scope.sortAllDesc(el.topics)
            }
        })
    }

    $scope.openModal = function(id){
        ModalService.Open(id);
    }

    $scope.closeModal = function(id){
        ModalService.Close(id);
    }

    $scope.showTopicText = function($event, topic) {
        console.log('Clicked topic: ', topic)
        console.log('Clicked $event: ', $event)

        if(topic.hasOwnProperty('showText')) {
            topic.showText = !topic.showText;
        } else {
            topic.showText = true;
        }

        $scope.current_topic = topic
        console.log('$scope.current_topic: ', $scope.current_topic)
    }

}]);

/*var adminAreaController = app.controller(
    'ForumController',
    ['$scope', '$window', 'UserService', 'ModalService', 'ForumApiService', function($scope, $window, UserService, ModalService, ForumApiService) {
    var adminArea = this;

    // Do Onload Things...
    $scope.onload = function() {
    }

}]);*/