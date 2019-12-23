angular.module('userService', [])
.service('UserService', ['$http', function($http) {
    var current_user = {}; // array of modals on the page
    var service = {};
    var jwt_token = '';
    var is_logged = false;

    service.saveNewUser = function(user, _jwt_token, _exp) {
        current_user = user
        jwt_token = _jwt_token

        window.localStorage.setItem('user', JSON.stringify(current_user))
        window.localStorage.setItem('token', jwt_token)
        window.localStorage.setItem('exp', _exp)

        is_logged = true
    }

    service.doLogin = function(data, ForumApiService) {
        service.saveNewUser(data.user, data.token, data.exptime)

        ForumApiService.setJWTToken(data.token)
    }

    service.getUserAndToken = function() {
        return {
            user: JSON.parse(window.localStorage.getItem('user')),
            token: window.localStorage.getItem('token'),
            exp: window.localStorage.getItem('exp')
        }
    }

    service.isLogged = function() {
        return (window.localStorage['user'] || false) && (window.localStorage['token'] || false)
    }

    service.isLoginExpired = function() {
        // console.log('service.getUserAndToken(): ', service.getUserAndToken())

        return service.getUserAndToken().exp > (Date.now() * 1000)
    }

    service.isUserTokenValid = function(token, ForumApiService) {
        ForumApiService.setJWTToken(token)

        $http.defaults.headers.common['Content-Type'] = 'application/json;charset=utf-8'
        
        return $http.post(api.endpoint + '/user/isvalid', JSON.stringify({}))
    }

    service.isAdmin = function() {
        return this.isLogged() && this.getUserAndToken().user.is_admin
    }

    service.deleteUser = function() {
        window.localStorage.removeItem('user')
        window.localStorage.removeItem('token')
    }

    return service;
}])
