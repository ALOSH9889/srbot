'use strict';

var fs = require('fs.extra');
var path = require('path');
var spawn = require( 'child_process' ).spawn;

var CUSTOM_PHRASE_LOCATION = path.resolve(process.cwd(), 'customphrase.json');

module.exports = Train;

function Train(brain, speech, message) {
    var phraseExamples = [];
    var phraseName;
    speech.startConversation(message, function (err, convo) {
        convo.ask('What do you want to call this skill? \n' + 'Make sure it is a good file name (lowercase letter, no spaces).', [
            {
                pattern: '.*',
                callback: function (response, convo) {
                    phraseName = response.text;
                    convo.say('Ok, I\'m calling it `' + phraseName + '`.');
                    convo.say('Ok, now tell me a bunch things you might say when you mean `' + phraseName + '`.\nWhen you are done, just send me the word `done` on it\'s own on a line.');
                    convo.ask('What might you say?', [
                        {
                            pattern: '.*',
                            callback: function (response, convo) {
                                phraseExamples.push(response.text);
                                reprompt(convo);
                                convo.next();

                            }
                        }
                    ]);
                    convo.next();
                }
            }
        ]);

        var reprompt = function (convo) {
            convo.ask('Ok, how else?', [
                {
                    pattern: '^done$',
                    callback: function (response, convo) {
                        convo.say('Cool, let me think about that...');
                        brain.teach(phraseName, phraseExamples);
                        brain.think();
                        convo.say('Ok, now let me save that information.');
                        writeSkill(phraseName, phraseExamples, function (err) {
                            if (err) {
                                console.error(err);
                                convo.say('Something went wrong in writing that skill.');
                            }
                            convo.say('Awesome! Now you should check if I understand.');
                            convo.next();
                        });
                        convo.next();
                    }
                },
                {
                    pattern: '.*',
                    callback: function (response, convo) {
                        phraseExamples.push(response.text);
                        reprompt(convo);
                        convo.next();
                    }
                }
            ]);
        }
    });
};


var writeSkill = function (name, vocab, callback) {
    console.log('About to write files for new skill type...');
    fs.readFile(CUSTOM_PHRASE_LOCATION, function (err, data) {
        if (err) {
            console.error('Error loading custom JSON phrase into memory.');
            return callback(err);
        }
        console.log('Parsing custom phrase JSON.');
        var customPhrases = JSON.parse(data.toString());
        var currentVocab = customPhrases[name];
        console.log('Current Phrases: ' + currentVocab);
        if (currentVocab) {
            vocab.forEach(function (item) {
                if (!currentVocab.includes(item)) {
                    currentVocab.push(item);
                }
            });
        } else {
            currentVocab = vocab;
        }
        console.log('New Phrases: ' + currentVocab);
        customPhrases[name] = currentVocab;

        console.log('About to serialise new phrase object...');
        fs.writeFile(CUSTOM_PHRASE_LOCATION, JSON.stringify(customPhrases, null, 2), function (err) {
            if (err) {
                console.error('Error while writing new serialised phrase object.');
            }
            var emptySkillPath =  path.resolve(process.cwd(), 'lib', 'nlp', 'emptyskill.js');
            var newSkillPath = path.resolve(process.cwd(), 'skills', name + '.js');
            console.log('Writing updated phrase JSON finished.');
            if (fs.existsSync(newSkillPath)) {
                console.log('No need to copy, the file already exists.');
                callback();
            } else {
                console.log('Copying ' + emptySkillPath + ' to ' + newSkillPath + '.');

                //var cp = spawn( 'cp', [ emptySkillPath, newSkillPath ] );
                //cp.on('close', callback);
                fs.copy(emptySkillPath, newSkillPath, {replace: false}, callback);
                console.log('Finished copying. Callback should now occur.');
            }

        });
    });
};
