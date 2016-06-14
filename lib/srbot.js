'use strict';

const util = require('util');
const path = require('path');
const fs = require('fs.extra');
const SQLite = require('sqlite3').verbose();
const Bot = require('botkit');
const winston = require('winston');

const linker = require('./linking/linker');
const Train = require('./nlp/train');
const Brain = require('./nlp/brain');

var SRBot = function Constructor(settings) {
    this.controller = Bot.slackbot({
        debug: false,
        storage: undefined
    });

    this.channels = [];
    this.users = [];

    this.settings = settings;
    this.settings.debug = settings.debug || false;
    this.settings.name = settings.name || 'srbot';

    this.settings.config = JSON.parse(fs.readFileSync(
        path.resolve(process.cwd(), 'config.json'),
        'utf8')
    );

    this.settings.token = this.settings.token || this.settings.config.keys.slack;

    this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'srdata.db');

    this.brain = new Brain();
    this.teach = null;

    this.user = null;
    this.db = null;
};

//util.inherits(SRBot, Bot.slackbot);

module.exports = SRBot;

SRBot.prototype.run = function () {
    var self = this;

    this.controller.spawn({
        token: this.settings.token
    }).startRTM(function (err, bot) {
        if (err) throw err;
        bot.api.users.list({}, function (err, response) {
            if (response.hasOwnProperty('members') && response.ok) {
                response.members.forEach(function (member) {
                    self.users.push({name: member.name, id: member.id});
                });
            }
        });
        winston.log('info', 'Created user list.');

        bot.api.users.list({}, function (err, response) {
            if (response.hasOwnProperty('channels') && response.ok) {
                response.channels.forEach(function (channel) {
                    self.channels.push({name: channel.name, id: channel.id});
                });
                console.log('channels: ' + self.channels);
            }
        });
    });
    winston.log('info', 'Created channel list.');

    // on start
    this.controller.on('rtm_open', function (bot, message) {
        self.connectDb();
        self.firstRunCheck(bot, message);
        winston.log('info', 'Setting up the natural language parsing.');
        self.setUpNlp();
        winston.log('info', 'srbot has started.');
    });

    this.controller.on(['message_received', 'direct_mention', 'direct_message', 'mention', 'ambient'], function (bot, message) {
        if (message.text) {
            linker.getResponse(message.text, function (result) {
                if (result) {
                    winston.log('info', 'The linker received a message.');
                    bot.reply(message, result);
                }
            });
        }
    });

    this.controller.on(['message_received', 'direct_mention', 'direct_message', 'mention', 'ambient'], function (bot, message) {
        if (message.text) {
            if (message.text.toLowerCase() === 'start training') {
                winston.log('info', 'Training started.');
                Train(self.brain, bot, message);
            } else {
                try {
                    var interpretation = self.brain.interpret(message.text);
                    winston.log('info', 'srbot heard: ' + message.text);
                    winston.log('info', 'srbot interpreted it as: ' + interpretation.guess);
                    if (interpretation.guess) {
                        winston.log('info', 'Invoking skill: ' + interpretation.guess);
                        self.brain.invoke(interpretation.guess, interpretation, bot, message);
                    } else {
                        //bot.reply(message, 'Not sure what you said there.');
                        winston.log('info', 'srbot could not interpret the message: ' + message.text);

                        linker.getResponse(message.text, function (result) {
                            if (result) {
                                winston.log('info', 'The linker received a message.');
                                bot.reply(message, result);
                            }
                        });
                    }
                } catch (err) {
                    winston.log('error', err);
                }
            }
        }
    });
};

SRBot.prototype.connectDb = function () {
    if (!fs.existsSync(this.dbPath)) {
        winston.log('alert', 'The database does not exist.');
        process.exit(1);
    }
    this.db = new SQLite.Database(this.dbPath);
    winston.log('info', 'Opened databse connection.');
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
            winston.log('info', 'Running srbot for the first time. Saving meta-information.');
            winston.log('info', 'Replying to slack with welcome message.');
            bot.reply(message, this.settings.config.firstRunMessage);
            return self.db.run('INSERT INTO info(name, value) VALUES("lastrun", ?)', currentTime);
        }

        // update new last run time
        winston.log('info', 'srbot has run before. Updating meta-information.');
        self.db.run('UPDATE info SET value = ? WHERE name = "lastrun"', currentTime);
    });
};

SRBot.prototype.setUpNlp = function () {
    var customPhrasesText;
    var customPhrases;
    try {
        customPhrasesText = fs.readFileSync(path.resolve(process.cwd(), 'customphrase.json')).toString();
    } catch (err) {
        throw new Error('Could not find the customphrase json file.');
    }
    try {
        customPhrases = JSON.parse(customPhrasesText);
    } catch (err) {
        throw new Error('customphrase.json was not valid json. This needs fixing.');
    }

    winston.log('info', 'Teaching custom phrases.');
    this.teach = this.brain.teach.bind(this.brain);
    eachKey(customPhrases, this.teach);
    this.brain.think();
};

var eachKey = function (object, callback) {
    Object.keys(object).forEach(function (key) {
        callback(key, object[key]);
    });
};
