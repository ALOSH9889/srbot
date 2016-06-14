'use strict';

// based around the guide from
// github.com/andrew-templeton/bottie

const natural = require('natural');
const path = require('path');
const winston = require('winston');

var Brain = function Constructor() {
    this.classifier = new natural.LogisticRegressionClassifier();
    this.minimumConfidence = 0.7;
}

module.exports = Brain;

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
    if (guesses.length !== 0) {
        var guess = guesses.reduce(function (x, y) {
            return x && x.value > y.value ? x : y;
        });
        return {
            probabilities: guesses,
            guess: guess.value > this.minimumConfidence ? guess.label : null
        };
    } else {
        throw new Error('There are no guesses for this phrase.');
    }
};

Brain.prototype.invoke = function (skill, info, bot, message) {
    var skillCode;
    var skillPath;
    // get code for skill
    try {
        skillPath = path.resolve('skills', skill + '.js');
        skillCode = require(skillPath);
    } catch (err) {
        winston.log('error', err);
        throw new Error('Cannot find invoked skill: ' + skillPath);
    }
    // now run the code for the skill
    skillCode(skill, info, bot, message);
    return this;
};
