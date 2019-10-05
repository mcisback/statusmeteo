var app = angular.module('adminApp', [
    'globalConfigModule',
    'forumApiService',
    'modalService',
    'userService',
    'ckeditorDirective'
])

app.directive('dynamicModel', ['$compile', '$parse', function ($compile, $parse) {
    return {
        restrict: 'A',
        terminal: true,
        priority: 100000,
        link: function (scope, elem) {
            var name = $parse(elem.attr('dynamic-model'))(scope);
            elem.removeAttr('dynamic-model');
            elem.attr('ng-model', name);
            $compile(elem)(scope);
        }
    };
}]);

app.filter('capitalize', function() {
    return function(input) {
      return (angular.isString(input) && input.length > 0) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : input;
    }
});

var adminController = app.controller(
    'AdminController',
    ['$scope', '$window', 'UserService', 'ModalService', 'ForumApiService', 'GlobalConfig', 
    function($scope, $window, UserService, ModalService, ForumApiService, GlobalConfig) {
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
        $scope.newUser = {}

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
            console.log('GlobalConfig is: ', GlobalConfig)

            $scope.leftNavMenu = [
                {
                    text: 'Users',
                    active: true,
                    action: () => {adminCtrl.getUsers()},
                    deleteCallback: (_ids) => {
                        return ForumApiService.deleteManyUsers(_ids)
                    }
                },
                {
                    text: 'Forums',
                    active: false,
                    action: () => {adminCtrl.getForums()}
                },
                {
                    text: 'Topics',
                    active: false,
                    action: () => {adminCtrl.getTopics()}
                }
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
        }

        $scope.reloadNav = function() {
            $scope.navTo($scope.current_nav)
        }

        $scope.doDeleteCallback = function() {
            console.log('Calling DELETE Callback on: ', $scope.leftNavMenu[$scope.current_nav])

            console.log('Deleting: ', $scope.selectedRows.map(item => item._id))

            $scope.leftNavMenu[$scope.current_nav].deleteCallback(
                $scope.selectedRows.map(item => item._id)
            )
                .then(res => {
                    console.log('DELETE Callback res: ', res)

                    // $scope.reloadNav()
                })
                .catch(err => {
                    console.log('DELETE Callback err: ', err)
                })
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

        $scope.getExpRemainingHours = function() {
            const expDate = new Date(parseInt(UserService.getUserAndToken().exp))
            const today = Date.now()
    
            const differenceInHours = Math.abs(expDate - today) / 36e5
    
            return Math.round(differenceInHours).toString()
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
            console.log('ModalData is: ', $scope.modalData)
    
            ModalService.Open($scope.current_modal)
        }
    
        $scope.closeModal = function(id){
            $scope.current_modal = ''
    
            ModalService.Close(id)
        }
    
        $scope.closeCurrentModal = function(){
            console.log('closeCurrentModal is: ',  $scope.current_modal)
    
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

        $scope.login = function(user) {
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
    
                        // $scope.closeCurrentModal()
    
                        /*$scope.current_user = response.data.data.user
                        $scope.jwt_token = response.data.data.token
    
                        $scope._isLogged = true*/
                    } else {
                        console.log('Login Failed: ' + response.data.data.msg)
    
                        $scope.loginErrorMsg = response.data.data.msg || 'Errore Login Sconosciuto'
                    }
                })
        }

        $scope.openDataModal = function(action, _data) {
            $scope.modalData = {
                title: 'Data Editor',
                headers: $scope.dataHeaders,
                fields: $scope.dataFields,
                data: _data,
                action: action
            }

            $scope.modalErrorMsg = ''
            $scope.modalSuccessMsg = ''

            $scope.openModal('data-editor-modal')
        }

        adminCtrl.setData = function(data, fields) {

            console.log('setData fields: ', fields)

            $scope.data = data.map(item => {delete item['__v']; return item; })
            // $scope.dataHeaders = Object.keys(data[0])
            $scope.dataHeaders = Object.keys(data[0])
            $scope.dataFields = fields.map(item => {
                console.log(item)
                if(item.key == '__v'){
                    delete item;
                } else {
                    return item
                }
            })

            console.log('$scope.data: ', $scope.data)
            console.log('$scope.dataHeaders: ', $scope.dataHeaders)
            console.log('$scope.dataFields: ', $scope.dataFields)
        }

        $scope.modalSaveAction = function(data) {
            console.log('Modal Input Data: ', data)

            if(data.action == 'add') {
                if($scope.leftNavMenu[$scope.current_nav].text.toLowerCase() == 'users') {
                    console.log('Adding New User: ', data.data)

                    ForumApiService.registerNewUser(data.data)
                        .then(res => {
                            console.log('regiterNew User Received 200 response', res)

                            $scope.modalSuccessMsg = 'New User Created'

                            $scope.reloadNav()
                        })
                        .catch(err => {
                            console.log('Register New User Catch Error: ', err)

                            $scope.modalErrorMsg = err
                        })
                }
            } else if(data.action == 'edit') {
                if($scope.leftNavMenu[$scope.current_nav].text.toLowerCase() == 'users') {
                    console.log('Editing User: ', data.data)

                    // TODO
                }
            } else {
                alert('ERROR: Unknown modal action')

                throw new Error('Uknown modal action')
            }
        }

        adminCtrl.getUsers = function() {
            ForumApiService.getUsers()
                .then(response => response.data)
                .then(data => {
                    console.log('getUsers: ', data)

                    ForumApiService.getFieldsType('users')
                        .then(res => res.data.data.data)
                        .then(fields => {
                            console.log('Users Fields: ', fields)

                            adminCtrl.setData(data, fields)
                        })
                        .catch(err => console.log('Fields Error: ', err))
                })
                .catch(err => console.log(err))
        }

        adminCtrl.getForums = function() {
            ForumApiService.getForums()
                .then(response => response.data)
                .then(data => {
                    console.log('getForums: ', data)

                    ForumApiService.getFieldsType('forums')
                        .then(res => res.data.data.data)
                        .then(fields => {
                            console.log('Forums Fields: ', fields)

                            adminCtrl.setData(data, fields)
                        })
                        .catch(err => console.log('Fields Error: ', err))
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

                    ForumApiService.getFieldsType('topics')
                        .then(res => res.data.data.data)
                        .then(fields => {
                            console.log('Topics Fields: ', fields)

                            adminCtrl.setData(data, fields)
                        })
                        .catch(err => console.log('Fields Error: ', err))
                })
                .catch(err => console.log(err))
        }

    }
])