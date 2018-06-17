// Test change number two

var todoApp = angular.module('todoApp', ['firebase', 'angular-sortable-view']);

//CONTROLLERS

todoApp.controller('mainController', ['$scope', '$firebaseArray', '$firebaseAuth', '$log', function ($scope, $firebaseArray, $firebaseAuth, $log) {

    

    
    var ref = new Firebase("https://todoappangularjs.firebaseio.com");
    $scope.authObj = $firebaseAuth(ref);

    $scope.userLoggedIn = false;

    
    $scope.errors = [];
    
    $scope.login = function (usr, pwd) {
        $scope.authObj.$authWithPassword({
                email: usr,
                password: pwd
            })
            .then(function (authData) {
                var userString = usr.split('@')[0];
                $scope.userName = userString;
                //--
                $scope.fibaRefPath = 'https://todoappangularjs.firebaseio.com/' + $scope.userName;
                $scope.fibaRef = new Firebase($scope.fibaRefPath).orderByChild("id");
                $log.debug($scope.fibaRef);
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
                //$scope.flagchanged(flag, index);
                for (i = 0; i < $scope.syncObject.length; i++){
                    var flag = $scope.syncObject[i].flags;
                    $scope.flagchanged(flag, i);
                }
            
            
            
            
            
            })
            .catch(function (error) {
                $scope.errors.push("Authentication failed: " + error);
                console.error("Authentication failed:", error);
            });
            for (i = 0; i < $scope.syncObject.length; i++){
                var flag = $scope.syncObject[i].flags;
                $scope.flagchanged(flag, i);
            }
    }

    $scope.LogUserOut = function () {
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

    $scope.newItem = function (input, details, flag) {
        if (input.length > 0 && $scope.userLoggedIn == true) {
            var newID = $scope.todoList.length + 1;
            $log.info("New item:: Title: " + input + ", id: " + newID);
            $scope.syncObject.$add({
                "id": newID,
                "title": input,
                "details": details,
                "done": false,
                "flags": flag
            });

            $scope.newTodoItemText = "";
            $scope.newTodoItemDetails = "";
            $log.debug('syncObject: ' + $scope.syncObject);

        } else {
            $log.error('You are not currently logged in. Please log in before adding new items to your todo-list.');
            $scope.errors.push('You are not currently logged in. Please log in before adding new items to your todo-list.');
        }
    };

    $scope.lastError = function(){
        return $scope.errors[$scope.errors.lastIndexOf()]
    }
    
    $scope.flags = [{
            name: '-',
            color: '#E4EA52'
        }, {
            name: 'første prioritet',
            color: '#DC9090'
        }, {
            name: 'next up...',
            color: '#EFAC92'
        }, {
            name: 'nedprioriteret...',
            color: '#EFE892'
        }, {
            name: 'waiting for feedback',
            color: '#F5F5F5'
        }, {
            name: 'private',
            color: '#92D698'
        }
       ];
    
    $scope.addFlag = function(name, color){
        $scope.flags.push({
            name: name,
            color: color
        });
        $log.info('New Flag added: name: ' + name + ', color: ' + color);
        $scope.flagName = '';
        $scope.flagColor = '#FFFFFF';
    };
    
    $scope.flagchanged = function(flag, index){
        $log.info(index + ', ' + flag.color);
        var currentDOMelem = 'todoItem' + index;
        var element = document.getElementById(currentDOMelem);
        element.style.backgroundColor = flag.color;
        if($scope.syncObjectLocal[index].done == true){
            element.style.backgroundColor = "#555656";
        }
    }
    
    $scope.deleteFlag = function(flagToDelete){
        $scope.flags.pop(flagToDelete);
        $log.info('New Flag added: name: ' + flagToDelete.name + ', color: ' + flagToDelete.color);
    }
    
    $scope.onDroppingItem = function(item, indexFrom, indexTo){
        $log.log(indexFrom + " --> " + indexTo + " :: " + $scope.syncObject[indexTo].title);
        for (i = 0; i < $scope.syncObject.length; i++){
            $log.log(indexFrom + " --> " + indexTo + " :: " + $scope.syncObject[indexTo].title);
            $scope.syncObject[i].id = (i+1);
            $scope.syncObject.$save($scope.syncObject[i]);
        }
        //$scope.syncObject[indexTo].id = indexTo;
        $log.info("updated all items. Now Saving to database")
        $scope.syncObject.$save($scope.syncObject[indexTo]);
    }
    /*
    todoApp.filter('orderObjectBy', function() {
        return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if(reverse) filtered.reverse();
            return filtered;
        };
    });*/
}]);


//SERVICES
/*todoApp.service('listItemService', function () {
    this.doSomethingPlease = function () {
        alert('I did this...');
    };
});*/
todoApp.filter("toArray", function(){
    return function(obj) {
        var result = [];
        angular.forEach(obj, function(val, key) {
            result.push(val);
        });
        return result;
    };
});

//DIRECTIVES

todoApp.directive('todoListItem', [function () {

    //directive controller
    var controller = ['$scope', '$firebaseArray', '$firebaseAuth', '$log', function ($scope, $firebaseArray, $firebaseAuth, $log) {

        /*        $scope.fibaRef = new Firebase('https://todoappangularjs.firebaseio.com/ras');

                $scope.syncObject = $firebaseArray($scope.fibaRef);*/
           
        //$scope.TestArray = $scope.syncObjectLocal.comments;

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
        $scope.changeState = function (list, index, inputText, details, flag) {
            $log.info('state changed to ' + $scope.editable);
            if ($scope.editable == true) {
                //save changes
                $log.info("saving changes");
                $scope.editButtonText = "Edit";
                $scope.editable = !$scope.editable;
                var currentDOMelem = 'todoItem' + index;
                $scope.syncObjectLocal[index].title = inputText;
                //$scope.syncObjectLocal[index].details = details;
                $scope.flagchanged(flag, index);
                $log.info("saving changes - success");
                var DT = details;
                $scope.syncObjectLocal.details.$add(DT);
                $log.info("detils: " + $scope.syncObjectLocal[index].details);
                $scope.syncObjectLocal[index].flags = flag;
                $scope.syncObjectLocal.$save($scope.syncObjectLocal[index]);
                $scope.disabled = false;
                $scope.expanded = false;
                $scope.flagchanged(flag, index);
                $log.info("saving changes - success");
                //$scope.runAnimation(currentDOMelem, 'moveUp');
            } else {
                //enter editmode
                $log.info("enter editmode");
                $scope.expanded = true;
                $scope.disabled = true;
                $scope.editable = !$scope.editable;
                $scope.editButtonText = "Save";
                list[index].title = inputText;

            }
        };

        $scope.toggleDone = function (flag, index) {
            if (!$scope.editable) {
                $log.info('toggleDone');
                $scope.syncObjectLocal[index].done = !$scope.syncObjectLocal[index].done;
                $scope.flagchanged(flag, index);
                $scope.syncObjectLocal.$save($scope.syncObjectLocal[index]);
                
            }
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
        };

        $scope.toggleExpand = function () {
            if (!$scope.editable) {
                $scope.expanded = !$scope.expanded;
            }

        };
        
        //$scope.currentFlag
        
        //$scope.flags = $scope.syncObjectLocal.flags;
        
        $scope.flagchanged = function(flag, index){
            //$log.info(index + ': ' + flag.name + ', ' + flag.color);
            var currentDOMelem = 'todoItem' + index;
            var element = document.getElementById(currentDOMelem);
            element.style.backgroundColor = flag.color;
            if($scope.syncObjectLocal[index].done == true){
                element.style.backgroundColor = "#555656";
            }
        };  
        
        $scope.addComment = function(input, index){
            $log.info("adding comment");
            if (input.length > 0) {
                //ADDING COMMENT TO FIREBASE
                var ref = new Firebase('https://todoappangularjs.firebaseio.com/' + $scope.userNameLocal + '/' + $scope.syncObjectLocal[index].$id + '/comments');
                $log.info("ref: " + ref);
                var timeNow = new Date().toDateString();
                $log.log("timeNow: " + timeNow);
                var t = new Date();
                var sortFormattedDate = t.getTime();
                $log.log("sortFormattedDate: " + sortFormattedDate);
                ref.push({
                    "comment": input,
                    "date": timeNow,
                    "sortFormattedDate": sortFormattedDate
                });
                $scope.newComment = '';
            
 
                //
                
                
                
                
                
                //RUBBISH
                /*
                $scope.fibaRef = new Firebase(ref.toString()).orderByChild("id");
                $log.info("fibaRef: " + $scope.fibaRef);
                $scope.commentsObject = $firebaseArray($scope.fibaRef);
                $log.info("commentsObject: " + $scope.commentsObject);

                var post = $firebaseArray(ref);
                $log.info("post: " + post);
                var comments = $firebaseArray(ref.child(input)).$asArray;
                $log.info("comments: " + comments);
                
                //var newID = $scope.todoList.length + 1;
                $log.info("New comment: " + input + ", id: ");
                $log.info("syncObjectLocal[index]: " + $scope.syncObjectLocal[index]);
                $log.info("syncObjectLocal[index].comments: " + $scope.syncObjectLocal[index].comments);                
                $scope.syncObjectLocal[index].comments.$add({
                    //"id": newID,
                    "comment": input
                });
                */
            } 
            else {
                $log.error('Cannot add comment. something went wrong. Sorry!');
                $scope.errors.push('Cannot add comment. something went wrong. Sorry!');
            }
        };

    }];

    return {
        templateUrl: 'todoListItem.html',
        replace: true,
        scope: {
            changeEditStateFunction: "&",
            index: '@',
            todoListLocal: "=",
            syncObjectLocal: "=",
            flags: "=",
            userNameLocal: "="
        },
        controller: controller
    }
    //changeEditStateFunction({edit: edit})-->
    //    edit="{{editMode}}" change-edit-state-function="changeEditState(editMode)"
}]);