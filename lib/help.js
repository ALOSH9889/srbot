'use strict';

var Help = function Constructor(info, user) {
    this.info = info;
    this.user = user;
};

module.exports = Help;

Help.prototype.getResponse = function (message, res) {
    var lowerCaseMessage = message.text.toLowerCase();

    if (lowerCaseMessage.includes('srhelp trac')) {
        res(this.info.trac);
    } else if (lowerCaseMessage.includes('srhelp gerrit')) {
        res(this.info.gerrit);
    } else if (lowerCaseMessage.includes('srhelp') ||
        ((message.text.includes(this.user.id) || lowerCaseMessage.includes(this.user.name)) && lowerCaseMessage.includes('help')) ||
        (message.channel[0] === 'D' && lowerCaseMessage.includes('help'))) {
            res(this.info.info);
    };
}
