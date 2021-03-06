'use strict';

var QuestionDataPrototype = Object.create(Object.prototype, {
    _id: {writable: true, value: 0, enumerable: true},
    title: { writable: true, value: "", enumerable: true },
    author: { writable: true, value: 0, enumerable: true }, //TODO add object ID requirement here
    message: { writable: true, value: 0, enumerable: true },
    dateCreated: { writable: true, value: 0, enumerable: true },
    dateModified: { writable: true, value: 0, enumerable: true },
    upVotes: { writable: true, value: 0, enumerable: true },
    downVotes: { writable: true, value: 0, enumerable: true},
})

var Question = function(questionJSON, questionFactory) {
        //we need this to be NON-ENUMERABLE, else we get a circular dependancy when JSON.stringifying. Unfortunately setting non-enumerable on the prototype's property is not enough :(
        Object.defineProperty(this, 'qf', {writable:true, value:null, enumerable: false});
        this.qf = questionFactory;
        for (var property in QuestionDataPrototype) {
            if (questionJSON[property] !== undefined) {
                this[property] = questionJSON[property];
            }
        }
        return this;
    }
    Question.prototype = Object.create(QuestionDataPrototype, {
        qf: {writable: true, value: null, enumerable: false},
        score: {get: function() {
            return this.upVotes - this.downVotes;
        }},
    });
    Question.prototype.upVote = function() {
        this.qf.upVoteQuestion(this._id);
        this.upVotes++;       
    }
    Question.prototype.downVote = function() {
        this.qf.downVoteQuestion(this._id);
        this.downVotes++;          
    }
    Question.prototype.delete = function() {
        this.qf.deleteQuestion(this._id);
        this.qf.questions.delete(this._id);       
    }
//} Question


kusema.factory('questionFactory', ['$http' , '$routeParams', 'kusemaConfig', function($http, $routeParams, kusemaConfig) {

    var questionFactory = {};
    var urlBase = kusemaConfig.url()+'api/questions';

    questionFactory.getQuestions = function () {
        return $http.get(urlBase);
    };

    questionFactory.getNextTenQuestions = function (requestNumber) {
        return $http.get(urlBase + '/tenMore/' + requestNumber);
    };

    questionFactory.getQuestionById = function (id) {
        return $http.get(urlBase + '/' + id);
    };

    questionFactory.addQuestion = function (question) {
        return $http.post(urlBase, JSON.stringify(question));
    };

    questionFactory.updateQuestion = function (editedQuestion) {
        return $http.put(urlBase + '/' + $routeParams.id, editedQuestion);
    };

    questionFactory.upVoteQuestion = function (id) {
      return $http.put(urlBase + '/upvote/' + id);
    };

    questionFactory.downVoteQuestion = function (id) {
      return $http.put(urlBase + '/dnvote/' + id);
    };

    questionFactory.deleteQuestion = function (id) {
        return $http.delete(urlBase + '/' + id);
    };

    questionFactory.createQuestion = function(responseJSON) {
        return new Question(responseJSON, questionFactory);
    }


    questionFactory.questions = {
      numberOfRequestsForQuestions: 1,
      questionsList: [],
      add: function(responseJSON) {
        this.questionsList.push(questionFactory.createQuestion(responseJSON));
      },
      addQuestions: function(responseJSON) {
        this.questionsList = responseJSON.map(function(questionJSON) { return questionFactory.createQuestion(questionJSON)});
      },
      delete: function(id) {
        var questionIndex = this.getIndexOf(id);
        if (questionIndex) {
            this.questionsList.splice(questionIndex, 1);
        }
      },
      getIndexOf: function(id) {
        var possibleQuestions = this.questionsList.filter(function(question) {return question._id == id;});
        if (possibleQuestions.length > 0) {
            return possibleQuestions[0]
        } else {
            return null;
        }
      }
    };

    // Populate the questionList
    questionFactory.getNextTenQuestions(0)
    .success(function (quest) {
      questionFactory.questions.addQuestions(quest);
    })
    .error(function (error) {
      console.log('Unable to load questions: ' + error + error.message);
    });


    return questionFactory;
}])
