module.exports = function (skill, info, bot, message) {
    var responses = [
        'Stop showing off.',
        'No one likes a show off.',
    ];
    var chosenResponse = responses[Math.floor(Math.random() * responses.length)];
    bot.reply(message, chosenResponse);
};
