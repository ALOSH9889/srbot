'use strict';

// based around the guide from
// github.com/andrew-templeton/bottie

var natural = require('natural');

module.exports = Brain;

var Brain = function Constructor() {
    this.classifier = natural.LogicalRegressionClassifier();
    this.minimumConfidence = 0.7;
}

Brain.prototype.teach = function (label, phrases) {
    phrases.forEach(function (phrase) {
        // ingest an example for label -> phrase
        this.classifier.addDocument(phrase.toLowerCase(), label);
    }.bind(this));
    return this;
};

Brain.prototype.think = function () {
    this.classifier.train();
    return this;
};

Brain.prototype.interpret = function (phrase) {
    var guesses = this.classifier.getClassifications(phrase.toLowerCase());
    var guess = guesses.reduce(function (x, y) {
        return x && x.value > y.value ? x : y;
    });
    return {
        probabilities: guesses,
        guess: guess.value > this.minimumConfidence ? guess.label : null
    };
};

Brain.prototype.invoke = function (skill, info, bot, message) {
    var skillCode;
    // get code for skill
    try {
        skillCode = require('../../skills/' + skill);
    } catch (err) {
        throw new Error('Invoked skill does not exist.');
    }
    // now run the code for the skill
    skillCode(skill, info, bot, message);
};
