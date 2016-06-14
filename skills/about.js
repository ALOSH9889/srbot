var winston = require('winston');
var sleep = require('sleep');

module.exports = function (skill, info, bot, message) {
    winston.log('info', 'Running code for \'about\'.');
    bot.startConversation(message, function (err, convo) {
        convo.say('Let me tell you a bit about myself.');
        sleep.sleep(2);
        convo.say('Actually, I can\'t be bothered to do that right now, ask me later.');
        convo.next();
    });
};
