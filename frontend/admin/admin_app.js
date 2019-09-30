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
        $scope.selectedRows = []
        $scope.data = []

        $scope.leftNavMenu = []

         // column to sort
        $scope.column = null
        
        // sort ordering (Ascending or Descending). Set true for desending
        $scope.reverse = false;

        // called on header click
        $scope.sortColumn = function(col){
            $scope.column = col

            if($scope.reverse){
                $scope.reverse = false
                $scope.reverseclass = 'arrow-up'
            } else {
                $scope.reverse = true
                $scope.reverseclass = 'arrow-down'
            }
        }
        
        // remove and change class
        $scope.sortClass = function(col){
            if($scope.column == col ){
                if($scope.reverse){
                    return 'arrow-down' 
                } else {
                    return 'arrow-up'
                }
            }else{
                return ''
            }
        }

        // Do Onload Things...
        $scope.onload = function() {
            console.log('$scope.onload admin_app.js')

            $scope.leftNavMenu = [
                {text: 'Users', active: true, action: () => {adminCtrl.getUsers()}},
                {text: 'Forums', active: false, action: () => {adminCtrl.getForums()}},
                {text: 'Topics', active: false, action: () => {adminCtrl.getTopics()}}
            ]

            console.log('$scope.leftNavMenu: ', $scope.leftNavMenu)
            console.log('typeof $scope.leftNavMenu: ', typeof $scope.leftNavMenu)

            /*for(let i = 0; i < $scope.leftNavMenu; i++) {
                let item = $scope.leftNavMenu[i]

                Object.assign($scope.selectedRows, {
                    [item.text.toLowerCase()]: []
                })
            }

            console.log('$scope.selectedRows: ', $scope.selectedRows)*/

            ForumApiService.getFieldsType('users')
                .then(res => res.data)
                .then(data => console.log(data))
                .catch(err => console.log(err))
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

                if(UserService.isLoginExpired()) {
                    $scope.doLogout()
        
                    alert('Il Login è scaduto, devi rifare il login per accedere')
                    
                    return false
                }

                return true
            }

            return false
        }

        $scope.isAdmin = function() {
            return $scope.current_user.is_admin
        }

        $scope.selectRow = function(row) {
            if(!$scope.selectedRows.includes(row)) {
                $scope.selectedRows.push(row)

                console.log('ADD $scope.selectedRows: ', $scope.selectedRows)
            } else {
                $scope.selectedRows = $scope.selectedRows.filter(item => item._id !== row._id)

                console.log('DEL $scope.selectedRows: ', $scope.selectedRows)
            }
        }

        $scope.selectAllRows = function() {
            if($scope.selectedRows.length == 0){
                $scope.selectedRows = $scope.data
            } else {
                $scope.selectedRows = []
            }
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
            $scope.selectedRows = []

            console.log('Current Nav: ', $scope.leftNavMenu[$index])

            $scope.leftNavMenu[$index].active = true;

            $scope.current_nav = $index

            if($scope.leftNavMenu[$index].action){
                console.log('Running Nav Action')

                $scope.leftNavMenu[$index].action()
            }
        }

        $scope.isRowSelected = function(row) {
            return $scope.selectedRows.includes(row)
        }

        adminCtrl.setData = function(data) {

            $scope.data = data.map(item => {delete item['__v']; return item; })
            $scope.dataHeaders = Object.keys(data[0])

            console.log('$scope.data: ', $scope.data)
            console.log('$scope.dataHeaders: ', $scope.dataHeaders)
        }

        adminCtrl.getUsers = function() {
            ForumApiService.getUsers()
                .then(response => response.data)
                .then(data => {
                    console.log('getUsers: ', data)

                    adminCtrl.setData(data)
                })
                .catch(err => console.log(err))
        }

        adminCtrl.getForums = function() {
            ForumApiService.getForums()
                .then(response => response.data)
                .then(data => {
                    console.log('getForums: ', data)

                    adminCtrl.setData(data)
                })
                .catch(err => console.log(err))
        }

        adminCtrl.getTopics = function() {
            ForumApiService.getTopics({
                noLevel: true
            })
                .then(response => response.data)
                .then(data => {
                    console.log('getTopics: ', data)

                    adminCtrl.setData(data)
                })
                .catch(err => console.log(err))
        }

    }
])