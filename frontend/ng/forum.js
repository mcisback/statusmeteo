angular.module('forumApiService', [
    'globalConfigModule'
])
.service('ForumApiService', ['$http', 'GlobalConfig', function($http, GlobalConfig) {
    api = {}

    //api.endpoint = "http://localhost:8082/api"
    api.endpoint = GlobalConfig.appUrl + '/api'

    api.setJWTToken = function(jwt_token) {
        // $http.defaults.headers.Authorization = 'Bearer ' + jwt_token;
        $http.defaults.headers.common.Authorization = 'Bearer ' + jwt_token;
    }

    api.unsetJWTToken = function() {
        // $http.defaults.headers.Authorization = '';
        $http.defaults.headers.common.Authorization = '';
    }

    api.getTopics = function(opts={}) {
        let querystring = ''

        if('noLevel' in opts) {
            querystring += 'noLevel=' + opts.noLevel.toString() + '&'
        }

        if('level' in opts) {
            querystring += 'level' + opts.level + '&'
        }

        if(querystring !== '') {
            return $http.get(api.endpoint + '/topics?' + querystring)
        } else {
            return $http.get(api.endpoint + '/topics')
        }
    }

    api.getTopicsByForum = function(forum_id) {
        return $http.get(api.endpoint + '/topics/byforum/' + forum_id)
    }

    api.getTopicsByParent = function(parent_id) {
        return $http.get(api.endpoint + '/topics/byparent/' + parent_id)
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

        return $http.put(api.endpoint + '/topic/edit/' + topic_id, JSON.stringify(topic))
    }

    api.replyToTopic = function(parent_topic_id, topic) {
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'

        return $http.post(api.endpoint + '/topic/reply/' + parent_topic_id, JSON.stringify(topic))
    }

    api.deleteTopic = function(topic_id) {
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'

        return $http.delete(api.endpoint + '/topic/delete/' + topic_id)
    }

    api.searchTopics = function(query) {
        return $http.get(api.endpoint + '/topics/search/' + query)
    }

    api.searchTopicsByDate = function(date) {
        return $http.get(api.endpoint + '/topics/searchbydate/' + date)
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

    api.getUsers = function() {
        return $http.get(api.endpoint + '/users')
    }

    api.deleteUser = function(_id, user) {
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
        
        return $http.delete(api.endpoint + '/user/delete/' + _id)
    }

    api.deleteManyUsers = function(_ids) {
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
        
        return $http.post(api.endpoint + '/user/deletemany/', JSON.stringify(_ids))
    }

    api.getFieldsType = function(collection) {
        return $http.get(api.endpoint + '/getfields/' + collection)
    }

    api.resetPassword = function(user) {
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
        
        return $http.post(api.endpoint + '/user/resetpassword/', JSON.stringify(user))
    }

    return api
}])
