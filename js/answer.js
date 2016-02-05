var myApp = angular.module('myApp', ['firebase']);

myApp.controller('myCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject){
    var ref = new Firebase('https://adp-answer-button.firebaseio.com/');
    var usersRef = ref.child("users");
    var answersRef = ref.child("answers");
    var prevAnswersRef = ref.child("prevAnswers");
    var adminRef = ref.child("admins");
    var prevQuestionRef = ref.child("prevQuestion");
    var questionRef = ref.child("questions");
    var winnerRef = ref.child("winner");
    var imgRef = ref.child("img");

    $scope.users = $firebaseObject(usersRef);
    $scope.answers = $firebaseArray(answersRef);
    $scope.prevAnswers = $firebaseArray(prevAnswersRef);
    $scope.admins = $firebaseObject(adminRef);
    $scope.prevQuestion = $firebaseArray(prevQuestionRef);
    $scope.questions = $firebaseArray(questionRef);
    $scope.winner = $firebaseArray(winnerRef);
    $scope.img = $firebaseArray(imgRef);

    $scope.authObj = $firebaseAuth(ref);

    $scope.ranMail = "email" + Math.random() + "@poop.com";
    $scope.password = "default";
    $scope.nameInUse = false;
    $scope.adminClick = false;
    $scope.isAdmin = false;
    $scope.showScoreboard = false;
    $scope.teamMemberClick = false;
    $scope.teamMembers = [];
    $scope.showPrev = false;
    
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
                points: 0,
                members: ""
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

    $scope.newWinner = function(user, text) {
        $scope.removeWinner();
        $scope.winner.$add({
            user: user.handle,
            text: text
        });
    }

    $scope.removeWinner = function() {
        $scope.winner.$remove($scope.winner[0]);
        $scope.winner.$save();
    }

    $scope.newQuestion = function() {
        $scope.removePrevQuestion();
        $scope.removeAll();
        if ($scope.questions[0] != null) {
            $scope.prevQuestion.$add({
                text:$scope.questions[0].text
            });            
        }
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

    $scope.removePrevQuestion = function() {
        $scope.prevQuestion.$remove($scope.prevQuestion[0]);
        $scope.prevQuestion.$save();
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

    $scope.remove = function(data, answer) {
        answer.$remove(data);
        answer.$save();
    }

    $scope.removeAll = function() {
        $scope.removeWinner();
        $scope.prevAnswers.forEach(function(data) {
            $scope.remove(data, $scope.prevAnswers);
        })
        $scope.addToPrev();
        $scope.answers.forEach(function(data) {
            $scope.remove(data, $scope.answers);
        });
    }

    $scope.addToPrev = function() {
        $scope.answers.forEach(function(data) {
            $scope.prevAnswers.$add({
                userID:data.userID,
                text:data.text,
                time:data.time
            });
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

    $scope.removeImg = function() {
        $scope.img.$remove($scope.img[0]);
        $scope.img.$save();
    }

    $scope.addImg = function() {
        $scope.removeImg();
        $scope.img.$add({
            image: $scope.image
        });
    }

    $scope.addTeamMember = function(name) {
        var current = $scope.users[$scope.userID].members;
        if (current.length === 0) {
            $scope.users[$scope.userID].members = name;
        } else {
            $scope.users[$scope.userID].members = current + ", " + name;
        }
        $scope.users.$save()
        .then(function() {
            $scope.memberName = "";
        });
        checkMembers(name);
        console.log($scope.teamMembers)
    }

    var checkMembers = function(name) {
        var check = false;
        $scope.teamMembers.forEach(function(data) {
            if (name === data) {
                check = true;
            }
        });
        if (check != true) {
            $scope.teamMembers.push(name)
        }
    }

    $scope.removeTeamMember = function(name) {
        var index = $scope.teamMembers.indexOf(name);
        $scope.teamMembers.splice(index, 1);
        $scope.users[$scope.userID].members = "";
        $scope.users.$save();
        $scope.teamMembers.forEach(function(data) {
            $scope.addTeamMember(data);
        });
    }
});

myApp.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);

myApp.filter('orderObjectBy', function() {
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
});