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

    api.endpoint = "http://localhost:8081/api"

    api.getTopics = function() {
        return $http.get(api.endpoint + '/topics')
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

    $scope.showTopicText = function(el) {
        console.log('Clicked el: ', el)
    }

}]);