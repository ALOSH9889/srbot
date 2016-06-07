module.exports = function (skill, info, bot, message) {
    bot._reply(message, 'I understood this as ' + skill + ', but I am not currently configured to do anything.');
};
