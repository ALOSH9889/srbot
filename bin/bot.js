// bin/bot.js

'use strict';

var SRBot = require('../lib/srbot');

var token = process.env.BOT_API_KEY;
var dbPath = process.env.BOT_DB_PATH;
var name = process.env.BOT_NAME;

var srbot = new SRBot({
    token: token,
    dbPath: dbPath,
    name: name
});

srbot.run();
