'use strict';

const util = require('util');
const path = require('path');
const fs = require('fs');
const SQLite = require('sqlite3').verbose();
const Bot = require('botkit');
const linker = require('./linking/linker');
const Help = require('./help');

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

    var self = this;

    // on start
    this.controller.on('rtm_open', function (bot, message) {
        self.connectDb();
        self.firstRunCheck(bot, message);
        console.log('SRBot has started.');
    });

    this.controller.on(['message_received', 'direct_mention', 'direct_message', 'mention', 'ambient'], function (bot, message) {

        // just try all the things srbot can do for each message, and if it
        // works, that's great.

        if (message.text) {

            console.log('Received a message in scope, with body:\n  ' + message.text);

            var help = new Help(self.settings.config.help);
            help.getResponse(message.text, function (result) {
                if (result) {
                    bot.reply(message, result);
                }
            });

            linker.getResponse(message.text, function (result) {
                if (result) {
                    bot.reply(message, result);
                }
            });
        }
    });
};

SRBot.prototype.connectDb = function () {
    if (!fs.existsSync(this.dbPath)) {
                process.exit(1);
    }
    this.db = new SQLite.Database(this.dbPath);
    console.log('Opened databse connection.');
};

SRBot.prototype.firstRunCheck = function (bot, message) {
    var self = this;
    self.db.get('SELECT value FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
        if (err) {
            return
        }

        var currentTime = (new Date()).toJSON();

        if (!record) {
            // no record found, so must be first run
            console.log('Running srbot for the first time. Saving meta-information.');
            console.log('Replying to slack with welcome message.');
            bot.reply(message, this.settings.config.firstRunMessage);
            return self.db.run('INSERT INTO info(name, value) VALUES("lastrun", ?)', currentTime);
        }

        // update new last run time
        console.log('srbot has run before. Updating meta-information.');
        self.db.run('UPDATE info SET value = ? WHERE name = "lastrun"', currentTime);
    });
};
