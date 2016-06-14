var fs = require('fs.extra');
var path = require('path');
var winston = require('winston');

module.exports = function (skill, info, bot, message) {
    winston.log('info', 'Running code for \'help\'.');

    bot.startConversation(message, function (err, convo) {
        convo.say('I heard that you need help.');
        helpTopics = 'Here are the topics I can help you with:\n';
        var files = fs.readdirSync(path.resolve(process.cwd(), 'skills'));
        var files = files.map(function (file) {
            return file.split('.')[0];
        });
        helpTopics += files.join('`, `');
        helpTopics += '`.';
        convo.say(helpTopics);
        convo.ask('Which of those do you want help with? Or enter `done` to finish with help.', responses);
        convo.next();
    });
};

var reprompt = function (convo) {
    convo.ask('Anything else?', responses);
    convo.next();
}

var repeater = 0;
var responses = [
    {
        pattern: '^done$',
        callback: function (response, convo) {
            convo.say('Cool, I hope you found what you were looking for.');
            convo.next();
        }
    },
    {
        pattern: 'trac',
        callback: function (response, convo) {
            convo.say('I know a bit about trac, but I can\'t be bothered to tell you about it right now. Try again later.')
            reprompt(convo);
            convo.next();
        }
    },
    {
        pattern: 'gerrit',
        callback: function (response, convo) {
            convo.say('I know a bit about gerrit, but I can\'t be bothered to tell you about it right now. Try again later.')
            reprompt(convo);
            convo.next();
        }
    },
    {
        pattern: 'help',
        callback: function (response, convo) {
            if (repeater > 2) {
                convo.say('Very funny.');
                repeater += 1
            } else if (repeater > 5) {
                convo.say('This is getting ridiculous now. Just type `done` and be over with it.');
            } else {
                convo.say('I\'m not going to repeat myself.');
                repeater += 1;
            }
            reprompt(convo);
            convo.next();
        }
    },
    {
        pattern: '.*',
        callback: function (response, convo) {
            convo.say('It seems I don\'t know about that.');
            convo.next();
        }
    }
];
