var myApp = angular.module('myApp', ['firebase']);

myApp.controller('myCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject){
    var ref = new Firebase('https://adp-answer-button.firebaseio.com/');
    var usersRef = ref.child("users");
    var answersRef = ref.child("answers");
    var adminRef = ref.child("admins");
    var questionRef = ref.child("questions");
    var winnerRef = ref.child("winner");
    $scope.users = $firebaseObject(usersRef);
    $scope.answers = $firebaseArray(answersRef);
    $scope.admins = $firebaseObject(adminRef);
    $scope.questions = $firebaseArray(questionRef);
    $scope.winner = $firebaseArray(winnerRef);
    $scope.authObj = $firebaseAuth(ref);
    $scope.ranMail = "email" + Math.random() + "@poop.com";
    $scope.password = "default";
    $scope.nameInUse = false;
    $scope.adminClick = false;
    $scope.isAdmin = false;
    $scope.showScoreboard = false;
    

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
                points: 0
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
            $scope.admins[authData.uid] ={
                handle: $scope.adminName
            }
            $scope.getName = $scope.admins[authData.uid].handle;
            $scope.admins.$save();
            $scope.isAdmin = true;
        });
    }
        

    $scope.logIn = function(email, password) {
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

    $scope.newWinner = function(user) {
        $scope.removeWinner();
        $scope.winner.$add({
            user: user.handle
        });
    }

    $scope.removeWinner = function() {
        $scope.winner.$remove($scope.winner[0]);
        $scope.winner.$save();
    }

    $scope.newQuestion = function() {
        $scope.removeQuestion();
        $scope.questions.$add({
            text:$scope.questionInput
        })
        .then(function() {
            $scope.questionInput = "";
        });
    }

    $scope.removeQuestion = function() {
        $scope.questions.$remove($scope.questions[0]);
        $scope.questions.$save();
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
        $scope.logIn($scope.adminMail, $scope.adminPass).then(function(authData){
            $scope.userID = authData.uid;
            $scope.isAdmin = true;
        });
    }

    $scope.remove = function(data) {
        $scope.answers.$remove(data);
        $scope.users.$save();
        $scope.answers.$save();
    }

    $scope.removeAll = function() {
        $scope.answers.forEach(function(data) {
            $scope.remove(data);
        });
    }

    $scope.addPoints = function(user) {
        user.points += 1;
        $scope.users.$save();
    }

    $scope.decreasePoints = function(user) {
        user.points -= 1;
        $scope.users.$save();
    }
});