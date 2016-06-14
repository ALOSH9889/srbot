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
            return '`' + file.split('.')[0]; + '`';
        });
        helpTopics += files.join(', ');
        helpTopics += '`general`'
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
        pattern: 'general',
        callback: function (response, convo) {
            convo.say('I am a developing bot to help out with SR related matters.');
            convo.say('At the moment I do a bit of natural language parsing using https://npmjs.com/package/natural.');
            convo.say('I can also link to things like trac and gerrit.');
            reprompt(convo);
            convo.next();
        }
    },
    {
        pattern: 'trac',
        callback: function (response, convo) {
            convo.say('You can ask me about trac and I will try to help.');
            conso.say('I will also try to link to trac tickets, when you post in any channel I am in.');
            reprompt(convo);
            convo.next();
        }
    },
    {
        pattern: 'gerrit',
        callback: function (response, convo) {
            convo.say('If you ask me about gerrit, I will try to help.');
            convo.say('I can also link to gerrit commits, when you post them in any channel I am also in.');
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
