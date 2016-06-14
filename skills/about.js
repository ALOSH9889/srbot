var winston = require('winston');

module.exports = function (skill, info, bot, message) {
    winston.log('info', 'Running code for \'about\'.');
    bot.startConversation(message, function (err, convo) {
        convo.say('Let me tell you a bit about myself.');
        convo.say('Actually, I can\'t be bothered to do that right now, ask me later.');
        convo.next();
    });
};
