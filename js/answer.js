var myApp = angular.module('myApp', ['firebase']);

myApp.controller('myCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject){
    var ref = new Firebase('https://adp-answer-button.firebaseio.com/');
    var usersRef = ref.child("users");
    var answersRef = ref.child("answers");
    $scope.users = $firebaseObject(usersRef);
    $scope.answers = $firebaseArray(answersRef);
    $scope.authObj = $firebaseAuth(ref);

    var authData = $scope.authObj.$getAuth();

    // SignUp function
    $scope.signUp = function() {
        // Create user
        $scope.authObj.$createUser({
            email: $scope.email,
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
        })

        // Catch any errors
        .catch(function(error) {
        	if (error.code === "EMAIL_TAKEN") {
        		$scope.caughtError = "That email is already in use";
        	} else if (error.code === "INVALID_EMAIL") {
        		$scope.caughtError = "That is not a valid email... follow the format of black@blank.com";
        	} else {
        		$scope.caughtError = "Some other error with email... there probably aren't any though"
        	}
        });
    }

    $scope.logIn = function() {
        console.log('log in')
        return $scope.authObj.$authWithPassword({
            email: $scope.email,
            password: $scope.password
        })
    }

    $scope.setID = function() {
    	$scope.userID = $scope.handle;
    }

    $scope.teamAnswers = function() {
    	$scope.answers.$add({
    		text:$scope.handle,
    		time:Firebase.ServerValue.TIMESTAMP
    	});
    }
});