var Trac = require('../lib/linking/trac');
var Brain = require('../lib/nlp/brain');
var path = require('path');
var fs = require('fs.extra');
var winston = require('winston');

var trac = new Trac();

module.exports = function (skill, info, bot, message) {
    winston.log('info', 'Running code for \'trac\'.');

    var url = trac.getUrl(message.text);
    if (url) {
        trac.getMessage(url, function (err, res) {
            if (err) throw err;
            try {
                bot.reply(res);
            } catch (err); //TODO: find out why removing this breaks things.
        });
    } else {
        bot.startConversation(message, function (err, convo) {
            convo.ask('Did you want to know about a trac ticket?', [
                {
                    pattern: bot.utterances.yes,
                    callback: function (response, convo) {
                        aboutTrac(response, convo);
                        convo.next();
                    }
                },
                {
                    pattern: bot.utterances.no,
                    callback: function (response, convo) {
                        notAboutTrac(response, convo);
                        convo.next();
                    }
                }
            ]);
            convo.next();
        });
    }
};

var aboutTrac = function (response, convo) {
    convo.ask('Which ticket did you want to know about?', [
        {
            pattern: '^([0-9]+)$',
            callback: function (response, convo) {
                var url = 'https://studentrobotics.org/trac' + '/ticket/' + response.text;
                trac.getMessage(url, function (err, res) {
                    if (err) throw err;
                    convo.say(res);
                    convo.next();
                });
                convo.next();
            }
        },
        {
            pattern: '.*',
            callback: function (response, convo) {
                var url = trac.getUrl(response.text);
                if (url) {
                    trac.getMessage(url, function (err, res) {
                        if (err) throw err;
                        convo.say(res);
                        convo.next();
                    });
                } else {
                    convo.say('I\'m sorry, I didn\'t understand that ticket number.');
                    convo.next();
                }
            }
        }
    ]);
    convo.next();
};

var notAboutTrac = function (response, convo) {
    convo.say('Well I\'m not sure I can help you then.');
    convo.next();
};
