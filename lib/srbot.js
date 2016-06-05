'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

var linker = require('./linker');
var Help = require('./help');

var SRBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = settings.name || 'srbot';

    this.settings.config = JSON.parse(fs.readFileSync(
        path.resolve(process.cwd(), 'config.json'),
        'utf8')
    );

    this.settings.token = this.settings.token || this.settings.config.keys.slack;

    this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'srdata.db');

    this.user = null;
    this.db = null;
};

util.inherits(SRBot, Bot);

module.exports = SRBot;

SRBot.prototype.run = function () {
    SRBot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

SRBot.prototype._onStart = function () {
    this._loadBotUser();
    this._connectDb();
    this._firstRunCheck();
    console.log('Connected to', this.settings.name);
};

SRBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

SRBot.prototype._connectDb = function () {
    if (!fs.existsSync(this.dbPath)) {
        console.error('Database path ' + '"' + this.dbPath + '" does not exist or it\'s not readable.');
        process.exit(1);
    }

    this.db = new SQLite.Database(this.dbPath);
};

SRBot.prototype._firstRunCheck = function () {
    var self = this;
    self.db.get('SELECT value FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var currentTime = (new Date()).toJSON();

        if (!record) {
            // no record found, so must be first run
            console.log('SRBot running for the first time.')

            self._welcomeMessage();
            return self.db.run('INSERT INTO info(name, value) VALUES("lastrun", ?)', currentTime);
        }

        // update new last run time
        self.db.run('UPDATE info SET value = ? WHERE name = "lastrun"', currentTime);
    });
};

SRBot.prototype._welcomeMessage = function () {
    this.postMessageToChannel(this.channels[0].name, this.settings.config.firstRunMessage, {as_user: true});
};

// onMessage helper functions
SRBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

SRBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string';
};

SRBot.prototype._isFromSRBot = function (message) {
    return message.user === this.user.id;
};

SRBot.prototype._getChannelByID = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

SRBot.prototype._getUserByID = function (userId) {
    return this.users.filter(function (user) {
        return user.id === userId;
    })[0];
};

SRBot.prototype._onMessage = function (message) {
    // get help from srbot
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromSRBot(message)) {

            if (this._isAboutTrac(message)) {
                this._replyWithTracInfo(message);
            }
            if (this._isAboutGerrit(message)) {
                this._replyWithGerritInfo(message);
            }
            if (this._isAboutGroups(message)) {
                this._replyWithGroupsInfo(message);
            }

            var self = this;

            var help = new Help(self.settings.config.help, this.user);
            help.getResponse(message, function (result) {
                if (result) {
                    self._reply(message, result);
                }
            });

            linker.getResponse(message, function (result) {
                if (result) {
                    self._reply(message, result, {as_user: true, link_names: 1});
                }
            });
    }
};

SRBot.prototype._isAboutHelp = function (message) {
    var lowerCaseMessage = message.text.toLowerCase();
    return lowerCaseMessage.includes('srhelp') ||
        ((message.text.includes(this.user.id) || lowerCaseMessage.includes(this.user.name)) && lowerCaseMessage.includes('help')) ||
        (message.channel[0] === 'D' && lowerCaseMessage.includes('help'));
};

SRBot.prototype._isAboutTrac = function (message) {

}

SRBot.prototype._isAboutGerrit = function (message) {

}

SRBot.prototype._isAboutGroups = function (message) {

}

SRBot.prototype._reply = function (originalMessage, reply, options) {
    if (typeof options === 'undefined') {
        options = {as_user: true};
    }
    var self = this;
    if (originalMessage.channel[0] === 'C') {
        var channel = self._getChannelByID(originalMessage.channel);
        self.postMessageToChannel(channel.name, reply, options);
    } else if (originalMessage.channel[0] === 'D') {
        var user = self._getUserByID(originalMessage.user);
        self.postMessageToUser(user.name, reply, options);
    }
}
