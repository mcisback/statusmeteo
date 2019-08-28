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

    api.getTopics = function() {
        return $http.get(api.endpoint + '/topics')
    }

    api.addNewTopic = function(topic) {
        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
        
        return $http.post(api.endpoint + '/topic', JSON.stringify(topic))
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

var forumController = app.controller(
    'ForumController',
    ['$scope', 'ModalService', 'ForumApiService', function($scope, ModalService, ForumApiService) {
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
        topics: []
    }

    forum.addNewTopic = function(topic) {
        topic.timestamp = Date.now()
        topic.maxTm = topic.timestamp
        topic.level = 1
        topic.parent = 0

        console.log('New Topic is: ', topic)

        ForumApiService.addNewTopic(topic)
            .then(response => {
                $scope.apiResponse = response.data

                $scope.onload()
            })
    }
    
    // Do Onload Things...
    $scope.onload = function() {
        ForumApiService.getTopics()
            .then(response => {
                $scope.topics = response.data
                $scope.sortAll($scope.topics)
            })
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

    $scope.showTopicText = function($event, el) {
        console.log('Clicked el: ', el)
        console.log('Clicked $event: ', $event)
    }

}]);