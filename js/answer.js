var myApp = angular.module('myApp', ['firebase']);

myApp.controller('myCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject){
    var ref = new Firebase('https://adp-answer-button.firebaseio.com/');
    var usersRef = ref.child("users");
    var answersRef = ref.child("answers");
    var adminRef = ref.child("admins");
    $scope.users = $firebaseObject(usersRef);
    $scope.answers = $firebaseArray(answersRef);
    $scope.admins = $firebaseObject(adminRef);
    $scope.authObj = $firebaseAuth(ref);
    $scope.ranMail = "email" + Math.random() + "@poop.com";
    $scope.password = "default";
    $scope.nameInUse = false;
    $scope.adminClick = false;

    var authData = $scope.authObj.$getAuth();

    // SignUp function
    $scope.signUp = function() {
        // Create user
        $scope.authObj.$createUser({
            email: $scope.ranMail,
            password: $scope.password,       
        })

        // Once the user is created, call the logIn function
        .then($scope.logIn($scope.ranMail, $scope.password))

        // Once logged in, set and save the user data
        .then(function(authData) {
            $scope.userID = authData.uid;
            $scope.users[authData.uid] ={
                handle: $scope.handle,
                admin: false
            }
            $scope.users.$save()
        });
    }

    $scope.adminSignUp = function() {
        // Create user
        $scope.authObj.$createUser({
            email: $scope.adminMail,
            password: $scope.adminPass,       
        })

        // Once the user is created, call the logIn function
        .then($scope.logIn($scope.adminMail, $scope.adminPass))

        // Once logged in, set and save the user data
        .then(function(authData) {
            $scope.userID = authData.uid;
            $scope.users[authData.uid] ={
                handle: $scope.adminName,
                admin: true
            }
            $scope.users.$save()
        });
    }

    $scope.logIn = function(email, password, status) {
        return $scope.authObj.$authWithPassword({
            email: email,
            password: password
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
        $scope.nameInUse = false;
        $scope.users.forEach(function(data) {
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

    $scope.adminSignIn = function() {
        $scope.adminClick = true;
        $scope.logIn($scope.adminMail, $scope.adminPass).then(function(authData){
            $scope.userID = authData.uid;
        })
    }

    $scope.removeAll = function(data) {
        $scope.answers.$remove($scope.answers.$getRecord(data)).then(function(answersRef) {
            answersRef.key() === $scope.answers.$getRecord(data).$id;
        });
    }

    //make a login button for admins
    //then allow me to increment a value for score
    // $scope.like = function(tweet) {
    //     tweet.likes += 1;
    //     $scope.tweets.$save(tweet)
    // } 
    //something like that
});