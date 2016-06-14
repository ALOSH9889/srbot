var Gerrit = require('../lib/linking/gerrit');
var path = require('path');
var fs = require('fs.extra');
var winston = require('winston');

var gerrit = new Gerrit();

module.exports = function (skill, info, bot, message) {
    winston.log('info', 'Running code for \'gerrit\'.');

    var url = gerrit.getUrl(message.text);
    if (url) {
        gerrit.getMessage(url, function (err, res) {
            if (err) throw err;
            bot.reply(res);
        });
    } else {
        bot.startConversation(message, function (err, convo) {
            convo.ask('Did you want to know about a gerrit ticket?', [
                {
                    pattern: bot.utterances.yes,
                    callback: function (response, convo) {
                        aboutGerrit(response, convo);
                        convo.next();
                    }
                },
                {
                    pattern: bot.utterances.no,
                    callback: function (response, convo) {
                        notAboutGerrit(response, convo);
                        convo.next();
                    }
                }
            ]);
            convo.next();
        });
    }
};

var aboutGerrit = function (response, convo) {
    convo.ask('Which commit did you want to know about?', [
        {
            pattern: '^([0-9]+)$',
            callback: function (response, convo) {
                var url = 'https://studentrobotics.org/gerrit' + '/#/c/' + response.text;
                gerrit.getMessage(url, function (err, res) {
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
                var url = gerrit.getUrl(response.text);
                if (url) {
                    gerrit.getMessage(url, function (err, res) {
                        if (err) throw err;
                        convo.say(res);
                        convo.next();
                    });
                } else {
                    convo.say('I\'m sorry, I didn\'t understand that commit number.');
                    convo.next();
                }
            }
        }
    ]);
    convo.next();
};

var notAboutGerrit = function (response, convo) {
    convo.say('Well I\'m not sure I can help you then.');
    convo.next();
};
