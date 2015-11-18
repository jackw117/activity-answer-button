var myApp = angular.module('myApp', ['firebase']);

myApp.controller('myCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject){
    var ref = new Firebase('https://adp-answer-button.firebaseio.com/');
    var usersRef = ref.child("users");
    var answersRef = ref.child("answers");
    $scope.users = $firebaseObject(usersRef);
    $scope.answers = $firebaseArray(answersRef);
    $scope.authObj = $firebaseAuth(ref);
    $scope.ranMail = "email" + Math.random() + "@poop.com";
    $scope.password = "default";
    $scope.nameInUse = false;

    var authData = $scope.authObj.$getAuth();

    // SignUp function
    $scope.signUp = function() {
        // Create user
        $scope.authObj.$createUser({
            email: $scope.ranMail,
            password: $scope.password,       
        })

        // Once the user is created, call the logIn function
        .then($scope.logIn)

        // Once logged in, set and save the user data
        .then(function(authData) {
            $scope.userID = authData.uid;
            $scope.users[authData.uid] ={
                handle:$scope.handle
            }
            $scope.users.$save()
        });
    }

    $scope.logIn = function() {
        console.log('log in')
        return $scope.authObj.$authWithPassword({
            email: $scope.ranMail,
            password: $scope.password
        })
    }

    $scope.teamAnswers = function() {
    	$scope.answers.$add({
    		userID:$scope.userID,
    		text:$scope.answerInput,
    		time:Firebase.ServerValue.TIMESTAMP
    	})
        .then(function() {
            $scope.answerInput = "";
        });
    }

    $scope.checkNames = function() {
        console.log($scope.users);
        $scope.nameInUse = false;
        $scope.users.forEach(function(data) {
            console.log(data);
            if (data.handle === $scope.handle) {
                $scope.nameInUse = true;
            }
        });
        $scope.checkInUse();
    }

    $scope.checkInUse = function() {
        if (!$scope.nameInUse) {
            $scope.signUp();
        }
    }
});