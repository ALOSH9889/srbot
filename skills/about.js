var winston = require('winston');
var sleep = require('sleep');

module.exports = function (skill, info, bot, message) {
    var users = [];
    winston.log('info', 'Running code for \'about\'.');
    bot.startConversation(message, function (err, convo) {
        convo.say('Let me tell you a bit about myself.');
        sleep.sleep(2);
        convo.say('Actually, I can\'t be bothered to do that right now, ask me later.');
        convo.say('You can see the code and stuff though at https://github.com/MarsCapone/srbot.');
        bot.api.users.list({}, function (err, response) {
            if (response.hasOwnProperty('members') && response.ok) {
                response.members.forEach(function (member) {
                    users.push({name: member.name, id: member.id});
                });
                var me = users.filter(function (x) {
                    return /(samson|sdanziger|blueteeth)/.exec(x.name);
                })[0];
                convo.say('I guess if problems come up, or it turns out I\'m not online and you think I should be, you should message <@' + me.id + '|' + me.name + '>.');
                convo.next();
            }
        });
        convo.next();
    });
};
