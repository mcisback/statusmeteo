angular.module('userService', [])
.service('UserService', function() {
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
