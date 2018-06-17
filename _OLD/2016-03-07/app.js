var todoApp = angular.module('todoApp', ['firebase']);

//CONTROLLERS

todoApp.controller('mainController', ['$scope', '$firebaseArray', '$firebaseAuth', '$log', function ($scope, $firebaseArray, $firebaseAuth, $log) {

    var ref = new Firebase("https://todoappangularjs.firebaseio.com");
    $scope.authObj = $firebaseAuth(ref);

    $scope.userLoggedIn = false;
    
    $scope.login = function(usr, pwd){
        $scope.authObj.$authWithPassword({
            email: usr,
            password: pwd
        })
        .then(function (authData) {
            var userString = usr.split('@')[0];
            $scope.userName = userString;
            //--
            $scope.fibaRefPath = 'https://todoappangularjs.firebaseio.com/' + $scope.userName;
            $scope.fibaRef = new Firebase($scope.fibaRefPath);
            $scope.syncObject = $firebaseArray($scope.fibaRef);
            $scope.todoList = $scope.syncObject;
            //--
            document.getElementById("loginBox").className = "ng-hide";
            $scope.errors = [];
            $scope.userLoggedIn = true;
            $scope.collapsed = true;
            $scope.headerText = 'You are now logged in as ' + $scope.userName + ". Happy todo'ing.";
            console.log("Logged in as:", authData.uid);
            $scope.errors.push("Logged in as:", authData.uid);
        })
        .catch(function (error) {
            console.error("Authentication failed:", error);
            $scope.errors.push("Authentication failed:", error);
        });
    }
    
    $scope.LogUserOut = function(){
        $log.info('logging out...');
        $scope.authObj.$unauth();
        $scope.todoList = [];
        $scope.syncObject = [];
        $scope.userName = 'Anonymous';
        $scope.userLoggedIn = false;
        $scope.collapsed = false;
        $scope.headerText = 'You are now logged out! Please, log in again if you want to manage your todo list.';
        $scope.errors = [];
        $scope.errors.push('You are now logged out! Please, log in again if you want to manage your todo list.');
        
    }
    
    $scope.collapsed = false;

    $scope.userName = 'Anonymous';

    $scope.fibaRefPath = 'https://todoappangularjs.firebaseio.com/' + $scope.userName;

    $scope.fibaRef = new Firebase($scope.fibaRefPath);

    $scope.syncObject = $firebaseArray($scope.fibaRef);

    $scope.newTodoItemText = "";
    $scope.newTodoItemDetails = "";
    $scope.headerText = 'Please, log in if you want to manage your todo list.';

    $scope.todoList = $scope.syncObject;

    $scope.IndexForNewItems = $scope.todoList.length + 1;

    $scope.newItem = function (input, details) {
        if (input.length > 0 && $scope.userLoggedIn == true) {
            $scope.syncObject.$add({
                "title": input,
                "details": details,
                "done": false
            });

            $scope.newTodoItemText = "";
            $scope.newTodoItemDetails = "";
            $log.debug('syncObject: ' + $scope.syncObject);
            
        }
        else{
            $log.error('You are not currently logged in. Please log in before adding new items to your todo-list.');
            $scope.errors.push('You are not currently logged in. Please log in before adding new items to your todo-list.');
        }
    };
    
    $scope.errors = [];
    
}]);

//SERVICES
/*todoApp.service('listItemService', function () {
    this.doSomethingPlease = function () {
        alert('I did this...');
    };
});*/


//DIRECTIVES

todoApp.directive('todoListItem', [function () {

    //directive controller
    var controller = ['$scope', '$firebaseArray', '$log', function ($scope, $firebaseArray, $log) {

        /*        $scope.fibaRef = new Firebase('https://todoappangularjs.firebaseio.com/ras');

                $scope.syncObject = $firebaseArray($scope.fibaRef);*/

        $scope.editButtonText = "Edit";

        $scope.editable = false;

        $scope.expanded = false;

        $scope.disabled = false;


        //delete elements
        $scope.deleteItem = function (index) {
            $log.info('deleteItem function - index: ' + index);
            var item = $scope.syncObjectLocal[index];
            $scope.syncObjectLocal.$remove(item);
        };

        //edit and save changes to elements
        $scope.changeState = function (list, index, inputText, details) {
            $log.info('state changed to ' + $scope.editable);
            if ($scope.editable == true) {
                //save changes
                $log.info("saving changes");
                $scope.editButtonText = "Edit";
                $scope.editable = !$scope.editable;
                var currentDOMelem = 'todoItem' + index;
                $scope.syncObjectLocal[index].title = inputText;
                $scope.syncObjectLocal[index].details = details;
                $scope.syncObjectLocal.$save($scope.syncObjectLocal[index]);
                $scope.disabled = false;
                //$scope.runAnimation(currentDOMelem, 'moveUp');
            } else {
                //enter editmode
                $log.info("enter editmode");
                $scope.expanded = true;
                $scope.disabled = true;
                $scope.editable = !$scope.editable;
                $scope.editButtonText = "Save";
                $scope.list[index].title = inputText;

            }
        };

        $scope.toggleDone = function (index) {
            if (!$scope.editable) {
                $log.info('toggleDone');
                $scope.syncObjectLocal[index].done = !$scope.syncObjectLocal[index].done;
                $scope.syncObjectLocal.$save($scope.syncObjectLocal[index]);
            }
        };

        //swapping elements
        Array.prototype.swapItems = function (a, b) {
            this[a] = this.splice(b, 1, this[a])[0];
            return this;
        };

        $scope.swapItemsUp = function (list, index) {
            var indexB = (index - 1);
            list.swapItems(index, indexB);
            var currentDOMelem = 'todoItem' + index;
            //$scope.runAnimation(currentDOMelem, 'moveUp');
        };

        $scope.swapItemsDown = function (list, index) {
            var indexB = (index + 1);
            list.swapItems(index, indexB);
        };

        //animations
        $scope.runAnimation = function (DOMelem, animationName) {
            $log.info(DOMelem + ', ' + animationName);
            var element = document.getElementById(DOMelem);
            $log.info(element);

            element.addEventListener('webkitAnimationEnd', function () {
                this.style.webkitAnimationName = '';
            }, false);

            document.getElementById(DOMelem).onclick = function () {
                element.style.webkitAnimationName = animationName;
                // you'll probably want to preventDefault here.
            };
        }

        $scope.toggleExpand = function () {
            if (!$scope.editable) {
                $scope.expanded = !$scope.expanded;
            }

        }

    }];

    return {
        templateUrl: 'todoListItem.html',
        replace: true,
        scope: {
            changeEditStateFunction: "&",
            index: '@',
            todoListLocal: "=",
            syncObjectLocal: "="
        },
        controller: controller
    }
    //changeEditStateFunction({edit: edit})-->
    //    edit="{{editMode}}" change-edit-state-function="changeEditState(editMode)"
}]);