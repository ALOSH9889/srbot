'use strict';

var Help = function Constructor(info) {
    this.info = info;
};

module.exports = Help;

// help needs information about what to say in different cases, and it needs to
// know it's own user information so it can see if it is being talked about.
Help.prototype.getResponse = function (text, res) {
    if (text) {
        var lowerCaseMessage = text.toLowerCase();

        if (lowerCaseMessage.includes('srhelp trac')) {
            res(this.info.trac);
        } else if (lowerCaseMessage.includes('srhelp gerrit')) {
            res(this.info.gerrit);
        } else if (lowerCaseMessage.includes('srhelp')) {
            res(this.info.info);
        };
    }
}
