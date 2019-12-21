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

const ForumTypeEnum = Object.freeze({
    DISCUSSION: 'Discussion',
    NOWCASTING: 'NowCasting'
})

const ForumViewMode = Object.freeze({
    FORUM_MODE: 'F',
    TOPIC_MODE: 'T'
})

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

var app = angular.module('forumApp', [
    '720kb.datepicker',
    'globalConfigModule',
    'forumApiService',
    'modalService',
    'userService',
    'ckeditorDirective'
])

// Directives
app.directive('searchtopics', function () {
    return function ($scope, element) {
        console.log('search-topics binding to element: ', element)
        element.bind("keyup", function (event) {
          var val = element.val();
          if(val.length > 2) {
            $scope.searchTopics(val);
          }
        });
    };
});

app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});

app.filter('safeHtml', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    }
})

app.filter('formatDate', function () {
    return function (val) {
        let _date = new Date(val)

        return _date.toLocaleString(undefined, {
            //dateStyle: 'medium',
            day: '2-digit',
            month: 'short',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
    }
})

var forumController = app.controller(
    'ForumController',
    ['$scope', '$window', 'UserService', 'ModalService', 'ForumApiService', 'GlobalConfig',
    function($scope, $window, UserService, ModalService, ForumApiService, GlobalConfig) {
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
        user: {},
        username: '',
        forum: null
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
    $scope.current_topic = {}
    $scope.current_modal = ''
    $scope.current_modal_msgs = {}
    $scope.is_search = false
    $scope.search_date = ''
    $scope.appUrl = GlobalConfig.appUrl
    $scope.scopedForumTypeEnum = ForumTypeEnum
    $scope.scopedForumViewMode = ForumViewMode
    $scope.forumMode = ForumViewMode.FORUM_MODE

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

            // Set Auth Bearer Header
            ForumApiService.setJWTToken(userData.token)

            if(UserService.isLoginExpired()) {
                forum.doLogout()
    
                alert('Il Login è scaduto, devi rifare il login per accedere')
                
                return false
            }

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
        newTopic.level = parentTopic.level || 1
        newTopic.level++
        newTopic.parent = parentTopic._id
        newTopic.user = $scope.current_user._id
        newTopic.username = $scope.current_user.username
        newTopic.forum = $scope.currentForum._id

        // parentTopic.topics.push(newTopic)

        // $scope.loadTopics()

        // TODO Save to database

        ForumApiService.replyToTopic(parentTopic._id, newTopic)
            .then(res => {
                console.log('replyToTopic res: ', res)

                $scope.loadTopics()

                $scope.closeCurrentModal()
            })
            .catch(err => console.log(err))
    }

    forum.addTopicSameLevel = function(parentTopic, topic) {
        topic.timestamp = Date.now()
        topic.maxTm = topic.timestamp
        topic.level = parentTopic.level || 1
        topic.parent = parentTopic.parent
        topic.user = $scope.current_user._id
        topic.username = $scope.current_user.username
        topic.forum = $scope.currentForum._id

        console.log('AddTopicSameLevel is: ', topic)

        ForumApiService.replyToTopic(parentTopic.parent, topic)
            .then(res => {
                console.log('AddTopicSameLevel res: ', res)

                $scope.loadTopics()

                $scope.closeCurrentModal()
            })
            .catch(err => console.log(err))
    }
 
    forum.addNewTopic = function(topic) {
        topic.timestamp = Date.now()
        topic.maxTm = topic.timestamp
        topic.level = 1
        topic.parent = null
        topic.user = $scope.current_user._id
        topic.username = $scope.current_user.username
        topic.forum = $scope.currentForum._id

        console.log('New Topic is: ', topic)

        ForumApiService.addNewTopic(topic)
            .then(response => {
                // $scope.apiResponse = response.data

                $scope.loadTopics()

                $scope.closeCurrentModal()
            })
            .catch(err => console.log(err))
    }

    forum.editTopic = function(topic) {
        let newTopic = {}

        newTopic.title = topic.title
        newTopic.subtitle = topic.subtitle
        newTopic.text = topic.text

        ForumApiService.editTopic(topic._id, newTopic)
            .then(res => {
                console.log('editTopic res: ', res)

                $scope.loadTopics()

                $scope.closeCurrentModal()
            })
            .catch(err => console.log(err))
    }

    forum.deleteTopic = function(topic) {
        var r = confirm("Se cancelli il topic, non sarà più disponibile, sei sicuro ?");

        if (r == true) {
            ForumApiService.deleteTopic(topic._id)
            .then(response => {
                if(response.data.success == true) {
                    alert('Topic rimosso correttamente')
                } else {
                    alert('Qualcosa è andato storto')
                }

                console.log('deleteTopic response: ', response)

                $scope.loadTopics()
            })
        }
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

                    UserService.doLogin(response.data.data, ForumApiService)

                    $scope.closeCurrentModal()

                    /*$scope.current_user = response.data.data.user
                    $scope.jwt_token = response.data.data.token

                    $scope._isLogged = true*/
                } else {
                    console.log('Login Failed: ' + response.data.data.msg)

                    $scope.current_modal_msgs.errorMsg = response.data.data.msg || 'Errore Login Sconosciuto'
                }
            })
    }

    $scope.getExpRemainingHours = function() {
        const expDate = new Date(parseInt(UserService.getUserAndToken().exp))
        const today = Date.now()

        const differenceInHours = Math.abs(expDate - today) / 36e5

        return Math.round(differenceInHours).toString()
    }

    forum.registerNewUser = function(newUser) {
        ForumApiService.registerNewUser(newUser)
            .then(res => {
                console.log('Register New User Response: ', res)

                if(res.data.success === true) {
                    console.log('Register Success')

                    $scope.current_modal_msgs.errorMsg = undefined
                    $scope.current_modal_msgs.successMsg = 'Utente Creato, prego fare il login'
                } else {
                    console.log('Register Failed')

                    if (res.data.data.msg.includes('duplicate key')) {
                        $scope.current_modal_msgs.successMsg = undefined
                        $scope.current_modal_msgs.errorMsg = 'Registrazione Fallita: Email o Utente già in uso'
                    } else {
                        $scope.current_modal_msgs.successMsg = undefined
                        $scope.current_modal_msgs.errorMsg = 'Registrazione Fallita: ' + res.data.data.msg
                    }
                }
            })
            .catch(err => console.log('Register New User Error: ', err))
    }

    forum.resetPassword = function(user) {
        ForumApiService.resetPassword(user)
            .then(res => {
                console.log('Reset Password Response: ', res)

                if(res.data.success === true) {
                    console.log('Reset Password Success')

                    $scope.current_modal_msgs.errorMsg = undefined
                    $scope.current_modal_msgs.successMsg = res.data.data.msg
                } else {
                    console.log('Reset Password Failed')

                    $scope.current_modal_msgs.successMsg = undefined
                    $scope.current_modal_msgs.errorMsg = 'Recupero Password Fallito: ' + res.data.data.msg
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

                alert('Utente Modificato')

                $scope.closeCurrentModal()
            })
            .catch(err => console.log(err))
    }

    forum.doLogout = function() {
        console.log('Asking logout for user: ', $scope.current_user)

        UserService.deleteUser()

        $scope.current_user = {}
        $scope.jwt_token = ''

        $scope._isLogged = false
    }

    $scope.loadSearchResults = function(data) {
        $scope.topics = data

        $scope.is_search = true

        $scope.reOrderTopics()
    }

    $scope.searchTopics = function(query) {
        console.log('Searching: ', query)

        ForumApiService.searchTopics(query)
            .then(res => {
                console.log('Topics Search Result: ', res)

                $scope.loadSearchResults(res.data)
            })
            .catch(err => console.log(err))
    }

    $scope.doSearchDate = function($el) {
        $scope.search_date = $el.search_date

        console.log('doSearchDate Triggered')
        console.log('$scope.search_date', $scope.search_date)

        ForumApiService.searchTopics($scope.search_date)
            .then(res => {
                console.log('Topics SearchByDate Result: ', res)

                $scope.loadSearchResults(res.data)
            })
            .catch(err => console.log(err))
        
        // alert($scope.search_date)
    }

    $scope.doCancelSearch = function() {
        console.log('Cancelling Search')

        $scope.is_search = false
        $scope.search_date = ''

        $scope.loadTopics()
    }

    $scope.loadForum = function($event, $index, _forum) {
        console.log('loadForum $index: ', $index)
        console.log('loadForum, ev: ', $event, _forum)

        $scope.forumList.map(item => item.is_active = false)

        _forum.is_active = true;

        $scope.currentForum = _forum
        $scope.forumMode = ForumViewMode.FORUM_MODE

        console.log('New Current Forum is: ', $scope.currentForum)

        $scope.loadTopics()
    }

    $scope.flat = function(array) {
        var result = [];
        array.forEach(function (a) {
            result.push(a);
            if (Array.isArray(a.topics)) {
                result = result.concat($scope.flat(a.topics));
            }
        });
        return result;
    }

    $scope.reOrderTopics = function() {
        // if($scope.topics.length > 0){

            if($scope.currentForum.forum_type === ForumTypeEnum.DISCUSSION) {
                $scope.sortAll($scope.topics)

                $scope.topics = $scope.flat($scope.topics)
            } else if($scope.currentForum.forum_type === ForumTypeEnum.NOWCASTING) {
                console.log('reOrderTopics:$scope.topics: ', $scope.topics)
                
                $scope.topics = $scope.flat($scope.topics.sort(sortDesc))
            }
        // } else {
            // console.log('NO TOPICS !!!')
        // }
    }

    $scope.loadTopics = function() {

        ForumApiService.getTopicsByForum($scope.currentForum._id)
            .then(response => {
                console.log('getTopicsByForum response', response)

                $scope.topics = response.data
                // $scope.topics = $scope.rebuildTopics(response.data)

                console.log('loadTopics():$scope.current_topic: ', $scope.current_topic)
                console.log('loadTopics():$scope.forumMode: ', $scope.forumMode)

                //$scope.forumMode = ForumViewMode.FORUM_MODE

                console.log('$scope.topics: ', $scope.topics)

                if($scope.forumMode === ForumViewMode.TOPIC_MODE) {
                    if($scope.current_topic !== undefined) {
                        $scope.current_topic = $scope.topics.find((el) => el._id === $scope.current_topic._id)
                        $scope.topics = [$scope.current_topic]
                    }
                }

                $scope.reOrderTopics()
            })
    }
    
    // Do Onload Things...
    $scope.onload = function() {
        console.log('$scope.onload triggered')
        console.log('GlobalConfig is: ', GlobalConfig)
        console.log('$scope.is_search: ',$scope.is_search)

        ForumApiService.getForums()
            .then(response => {
                $scope.forumList = response.data
                // sortDescByOrder($scope.forumList)

                console.log('Forum List: ', $scope.forumList)

                $scope.currentForum = $scope.forumList[0]
                console.log('Current Forum is: ', $scope.currentForum)
            })
            .then(x => $scope.loadTopics())
            .then(x => $scope.is_search = false)
            .catch(err => console.log(err))
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

    $scope.openModal = function(id, checkIfLogged=false){
        if(checkIfLogged) {
            if(!$scope.isLogged()) {
                $scope.current_modal = 'login-modal'
            } else {
                $scope.current_modal = id
            }
        } else {
            $scope.current_modal = id
        }

        console.log('openModal current_modal is: ', $scope.current_modal)

        ModalService.Open($scope.current_modal)
    }

    $scope.closeModal = function(id){
        $scope.current_modal = ''

        ModalService.Close(id)
    }

    $scope.closeCurrentModal = function(){
        console.log('closeCurrentModal is: ',  $scope.current_modal)

        $scope.current_modal_msgs = {}

        $scope.closeModal($scope.current_modal)
    }

    forum.topicOnClick = function(action, topic) {
        const map = {
            new_topic: 'new-topic-editor-modal',
            add_topic: 'add-topic-editor-modal',
            reply_topic: 'reply-topic-editor-modal',
            edit_topic: 'edit-topic-editor-modal'
        }

        if(!(action in map)) {
            throw new Error('Topic Action not present')
        }

        $scope.current_topic = topic

        $scope.openModal(map[action], true)
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
        console.log('$scope.currentForum: ', $scope.currentForum)

        if($scope.currentForum.forum_type === ForumTypeEnum.DISCUSSION) {

            if($scope.current_topic.level == 1){
                console.log('Discussion Forum Mode')

                // Current Topic => Array => Topics List
                $scope.topics = [$scope.current_topic]
                $scope.forumMode = ForumViewMode.TOPIC_MODE

                console.log('$scope.forumMode = ForumViewMode.TOPIC_MODE')

                $scope.reOrderTopics()
            }
        } else {
            console.log('NowCasting Forum Mode')

            $scope.forumMode = ForumViewMode.FORUM_MODE
        }
    }

    $scope.doHideTopic = function(topic) {

        // console.log('$scope.doHideTopic:$scope.currentForum: ', $scope.currentForum)

        if($scope.currentForum !== undefined && topic !== undefined){
            let res = $scope.currentForum.forum_type === ForumTypeEnum.DISCUSSION 
            res = res && $scope.forumMode === ForumViewMode.FORUM_MODE
            res = res && topic.level > 1

            // console.log('doHideTopic: ', res)

            return res;
        }

        return false;
    }
    
    $scope.goToLevelOne = function() {
        console.log('Going Home To Level One...')

        $scope.forumMode = ForumViewMode.FORUM_MODE

        $scope.loadTopics()
    }
}]);
