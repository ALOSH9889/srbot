'use strict';

var fs = require('fs');
var path = require('path');

var CUSTOM_PHRASE_LOCATION = path.resolve(process.cwd(), 'config.json'), 'utf8');

module.exports = Train;

var Train = function Constructor (brain, speech, message) {
    var phraseExamples = [];
    var phraseName;
    speech.startConversation(message, )
}
