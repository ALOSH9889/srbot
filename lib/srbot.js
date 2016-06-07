'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('botkit');
var linker = require('./linking/linker');
var Help = require('./help');

var SRBot = function Constructor(settings) {
    this.controller = Bot.slackbot({
        debug: false,
        storage: undefined
    });

    this.settings = settings;
    this.settings.debug = settings.debug || false;
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

//util.inherits(SRBot, Bot.slackbot);

module.exports = SRBot;

SRBot.prototype.run = function () {
    this.controller.spawn({
        token: this.settings.token
    }).startRTM();

    this.controller.on('rtm_open', this._onStart);
    this.controller.on(['message_received', 'direct_mention', 'direct_message'], this._onMessage);
};

SRBot.prototype._onStart = function (bot, message) {
    var self = this;
//    self._connectDb();
    self._firstRunCheck(bot, message);

    console.log('SRBot has successfully started.');
};

SRBot.prototype._onMessage = function (bot, message) {
    var self = this;

    // just try all the things srbot can do for each message, and if it
    // works, that's great.

    var help = new Help(self.settings.config.help, this.user);
    help.getResponse(message, function (result) {
        if (result) {
            bot.reply(message, result);
        }
    });

    linker.getResponse(message, function (result) {
        if (result) {
            bot.reply(message, result, {as_user: true, link_names: 1});
        }
    });
};

SRBot.prototype._connectDb = function () {
    if (!fs.existsSync(this.dbPath)) {
                process.exit(1);
    }
    this.db = new SQLite.Database(this.dbPath);
};

SRBot.prototype._firstRunCheck = function (bot, message) {
    var self = this;
    self.db.get('SELECT value FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
        if (err) {
            return         }

        var currentTime = (new Date()).toJSON();

        if (!record) {
            // no record found, so must be first run

            self._welcomeMessage(bot, message);
            return self.db.run('INSERT INTO info(name, value) VALUES("lastrun", ?)', currentTime);
        }

        // update new last run time
        self.db.run('UPDATE info SET value = ? WHERE name = "lastrun"', currentTime);
    });
};


SRBot.prototype._welcomeMessage = function (bot, message) {
    bot.reply(message, this.settings.config.firstRunMessage);
};
