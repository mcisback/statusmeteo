var app = angular.module('adminApp', [
    'forumApiService',
    'modalService',
    'userService'
])

var adminController = app.controller(
    'AdminController',
    ['$scope', '$window', 'UserService', 'ModalService', 'ForumApiService', 
    function($scope, $window, UserService, ModalService, ForumApiService) {
        var adminCtrl = this

        $scope._isLogged = false
        $scope._isAdmin = false
        $scope.current_user = {}
        $scope.jwt_token = ''
        $scope.current_page = 0
        $scope.current_topic = {}
        $scope.current_modal = ''
        $scope.ishover = false

        $scope.leftNavMenu = [
            {text: 'Users', active: true, action: () => {adminCtrl.getUsers()}},
            {text: 'Forums', active: false, action: () => {adminCtrl.getForums()}},
            {text: 'Topics', active: false, action: () => {adminCtrl.getTopics()}}
        ]

        // Do Onload Things...
        $scope.onload = function() {
            console.log('$scope.onload admin_app.js')

            ForumApiService.getFieldsType('users')
                .then(res => res.data)
                .then(data => console.log(data))
                .catch(err => console.log(err))
        }

        $scope.hoverIn = function($event) {
            console.log($event)
        }

        $scope.hoverOut = function($event) {
            console.log($event)
        }

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

        $scope.isAdmin = function() {
            return $scope.current_user.is_admin
        }

        $scope.doLogout = function() {
            console.log('Asking logout for user: ', $scope.current_user)
    
            UserService.deleteUser()
    
            $scope.current_user = {}
            $scope.jwt_token = ''
    
            $scope._isLogged = false
        }

        $scope.openModal = function(id){
            $scope.current_modal = id

            ModalService.Open(id)
        }

        $scope.closeModal = function(id){
            $scope.current_modal = ''

            ModalService.Close(id)
        }

        $scope.closeCurrentModal = function(){
            $scope.closeModal($scope.current_modal)
        }

        $scope.navTo = function($index) {
            $scope.leftNavMenu.map(item => item.active = false)

            console.log('Current Nav: ', $scope.leftNavMenu[$index])

            $scope.leftNavMenu[$index].active = true;

            $scope.current_nav = $index

            if($scope.leftNavMenu[$index].action){
                console.log('Running Nav Action')

                $scope.leftNavMenu[$index].action()
            }
        }

        adminCtrl.getUsers = function() {
            ForumApiService.getUsers()
                .then(response => response.data)
                .then(data => {
                    console.log('getUsers: ', data)

                    $scope.data = data
                    $scope.dataHeaders = Object.keys(data[0])

                    console.log('$scope.data: ', $scope.data)
                    console.log('$scope.dataHeaders: ', $scope.dataHeaders)
                })
                .catch(err => console.log(err))
        }

        adminCtrl.getForums = function() {
            ForumApiService.getForums()
                .then(response => response.data)
                .then(data => {
                    console.log('getForums: ', data)

                    $scope.data = data
                    $scope.dataHeaders = Object.keys(data[0])

                    console.log('$scope.data: ', $scope.data)
                    console.log('$scope.dataHeaders: ', $scope.dataHeaders)
                })
                .catch(err => console.log(err))
        }

        adminCtrl.getTopics = function() {
            ForumApiService.getTopics()
                .then(response => response.data)
                .then(data => {
                    console.log('getTopics: ', data)

                    $scope.data = data
                    $scope.dataHeaders = Object.keys(data[0])

                    console.log('$scope.data: ', $scope.data)
                    console.log('$scope.dataHeaders: ', $scope.dataHeaders)
                })
                .catch(err => console.log(err))
        }

    }
])