var app = angular.module("myapp", ['ngRoute']);
app.config(function($routeProvider){
    $routeProvider
    .when('/',{
        templateUrl: 'home.html'
    })
    .when('/!courses',{
        templateUrl: 'courses.html',
        controller:'subjectsCtrl'
    })
    .when('/!contact',{
        templateUrl: 'contact.html',
    })
    .when('/!profile',{
        templateUrl: 'profile.html',
    })
   
    .when('/!quiz/:id/:name',{
        templateUrl: 'quiz.html',    
        controller:'quizCtrl'
    })
    .otherwise({
        redirectTo:"/"
    })

})

app.controller("quizCtrl", function ($scope, $http,$routeParams,quizFactor) {
    $http.get('../db/Quizs/'+$routeParams.id+'.js').then(function(res){
        quizFactor.questions = res.data
    })
}) 

app.controller("subjectsCtrl", function ($scope, $http) {
    $scope.list_subject =[]   ;
    $http.get('../db/Subjects.js').then(function(res){
        $scope.list_subject = res.data;
    })
})  

app.directive('quiz', function(quizFactor,$routeParams){
    return{
        restrict: 'AE',
        scope:{},
        templateUrl:'template-quiz.html',
        link: function(scope,elem,atrs){
            scope.start = function(){
                if(!sessionStorage.getItem('nameUser')){
                    alert("Bạn cần đăng nhập để làm quiz")
                    document.location = "login.html"
                }else{
                    quizFactor.getQuestions().then(function(){
                        scope.subjectName = $routeParams.name
                        scope.id=0;
                        scope.quizOver = false // chưa hoàn thành
                        scope.inProgess = true;
                        scope.getQuestion();
                        scope.loadQuestion();
                        scope.freques = false;
                    })
                }
               
            };
            
            scope.reset = function(){
                scope.inProgess = false;
                scope.score = 0;
                scope.i = 1;
                scope.showBtnHandIn();
                scope.listAns = [];
                // console.log(scope.listAns.length);
            }

            scope.mark = 0;
            scope.handInQuizz = function() {          
                scope.quizOver = true;                       
                for(var i = 0; i < scope.listAns.length; i++) {
                    console.log(`Câu TL:  ${scope.listAns[i].ans}, Đáp án: ${scope.listAns[i].idAnsRight}`);
                    if(scope.listAns[i].ans == scope.listAns[i].idAnsRight) {
                        scope.mark++;
                    }           
                }
                // clearInterval()
                if(scope.mark >= 5){
                    return scope.result = "đậu"
                }
                else{
                    return scope.result  ="trượt"
                }
                
            }

            scope.showBtnHandIn = function() {
                scope.freques = false;
                // if(scope.listAns.length >= 9) {
                //     scope.freques = true;
                // } else {
                //     scope.freques = false;
                // }
                for (var i = 0; i < scope.listAns.length; i++) {
                    console.log(scope.listAns[i].ans != undefined);
                    if(scope.listAns[i].ans != undefined) {
                        scope.freques = true;
                        // console.log(scope.listAns[i].ans != undefined);
                    } else {
                        scope.freques = false;
                    }
                }
                console.log(scope.listAns);
            }

            scope.getQuestion = function(){
                var quiz = quizFactor.getQuestion(scope.id);
                if(quiz){
                    scope.question = quiz.Text;
                    scope.options =  quiz.Answers
                    scope.answer = quiz.AnswerId;
                    scope.answerMode = true;
                }else{
                    scope.quizOver = true;
                }                
            }

            scope.checkAnswer = function(){    
                if(!$('input[name =quizQes]:checked').length) return;
                var ans = $('input[name =quizQes]:checked').val();
                if(ans == scope.answer){
                    // alert('Đúng')
                    scope.score++;
                    scope.correctAns = true;
                }else{
                    // alert('Sai')
                    scope.correctAns = false;
                }
                scope.answerMode = false;
            }

            scope.listAns = [];
            scope.addAnswer = function() {
                // if(!$('input[name = quizQes]:checked').length) return;
                // var ans = $('input[name = quizQes]:checked').val();
                scope.countNumAns();

                for(var i = 0; i < scope.listQuestions.length; i++) {
                    scope.ansId = scope.listQuestions[i].AnswerId;
                    // if(!$(`input[name = ${scope.ansId}]:checked`).length) return;
                    var ans = $(`input[name = ${scope.ansId}]:checked`).val();
                    
                    
                    if((scope.listAns.length > 0)) {
                        for(var j = 0; j < scope.listAns.length; j++) {
                            
                            if(scope.listAns[j].idQes == scope.listQuestions[j].Id) {
                                scope.ansItem = {
                                    idQes: scope.listQuestions[i].Id,                
                                    idAnsRight: scope.listQuestions[i].AnswerId,
                                    ans,           
                                }
                                scope.listAns.splice(i, 1, scope.ansItem);
                                break;

                            } else {
                                scope.ansItem = {
                                    idQes: scope.listQuestions[i].Id,                
                                    idAnsRight: scope.listQuestions[i].AnswerId,
                                    ans,           
                                }
            
                                if((scope.listAns).length < 10) {
                                    scope.listAns.push(scope.ansItem);
                                }
                                break;
                            }
                        }
                    } else {
                        scope.ansItem = {
                            idQes: scope.listQuestions[i].Id,                
                            idAnsRight: scope.listQuestions[i].AnswerId,
                            ans,           
                        }
    
                        if((scope.listAns).length < 10) {
                            scope.listAns.push(scope.ansItem);
                        }
                        // console.log(scope.listAns);
                    }   
                    // console.log((scope.listAns));
                }

            }

            scope.nextQuestion = function(){
                scope.id++;
                scope.a = '';
                scope.i++;
                scope.getQuestion();
            }

            scope.c = 1;
            scope.countNumAns = function(){
                if(scope.c >= 0 && scope.c < 10) {
                    scope.c++;
                } else if(scope.c >= 10) {
                    scope.c = 1;
                }else if(scope.c < 0) {
                    scope.c = 9;
                }

                scope.showBtnHandIn();
            }

            scope.countNumAnsPrev = function(){
                if(scope.c > 1) {
                    scope.c--;
                } else if(scope.c >= 10) {
                    scope.c = 1;
                }else if(scope.c <= 1) {
                    scope.c = 10;
                }

                scope.showBtnHandIn();
            }

            scope.loadQuestion = function(){
                scope.listQuestions = [];
                for (var i = 0; i < 10; i++) {

                    var quiz = quizFactor.getQuestion(scope.id);
                    if(quiz){
                        scope.question = quiz.Text;
                        scope.options =  quiz.Answers
                        scope.answer = quiz.AnswerId;
                        scope.answerMode = true;
                    }else{
                        scope.quizOver = false;
                    } 
                    scope.listQuestions.push(quiz);
                    // console.log(scope.i);
                }
                scope.id++
            }

            scope.reset()
            if(scope.scope > 5){
                return scope.result = "đậu"
            }
            else{
                return scope.result  ="trượt"
            }

           
        }
    }
});

app.factory('quizFactor', function($http,$routeParams){
 
    return{
        getQuestions:function(){
            return  $http.get('../db/Quizs/'+$routeParams.id+'.js').then(function(res){
                questions = res.data            
            });
        },

        getQuestion:function(id){
            var randomItem = questions[Math.floor(Math.random() * questions.length)]
            var count = questions.length;
            
            
            if(count >10){
                count = 10;
                if(id<10){
                    return randomItem;
                }
                else{
                    return false;
                }
            }        
        }
    }
})
app.controller("TimeQuiz",function($scope,$interval){
   
    $scope.time =  7

     $interval(function(){

        $scope.time =  $scope.time - 01;  

        if($scope.time == 0){

        
            $scope.handInQuizz();

            clearInterval(); 
         
        }

    },1000)

})


app.controller("login",function($scope){
  
    if(sessionStorage.getItem('nameUser')){

        $scope.user= true;

    }else{

        $scope.user= false;

    }
   

    $scope.logout = function(){
        sessionStorage.clear();
        window.location.reload();
    }
})