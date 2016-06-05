'use strict';

var winston = require('winston');

var Trac = require('./trac');
var Gerrit = require('./gerrit');

var tracRoot = 'https://studentrobotics.org/trac';
var gerritRoot = 'https://studentrobotics.org/gerrit';

var tracRe = /(trac|t):(\d+)/i;
var gerritRe = /(gerrit|ger|g):(\d+)/i;

exports.getResponse = function (message, cb) {
    var tracMatch = tracRe.exec(message.text);
    var gerritMatch = gerritRe.exec(message.text);

    if (tracMatch) {
        winston.info('Found a something to do with Trac that needs linking.');
        
        var url = tracRoot + '/ticket/' + tracMatch[2];
        var trac = new Trac();
        trac.getMessage(url, function (err, title) {
            if (err) throw err;
            cb(title);
        });
    } else if (gerritMatch) {
        winston.info('Found something to do with Gerrit that needs linking.');

        var url = gerritRoot + '/#/c/' + gerritMatch[2];
        cb(url);
    }
    return null;
};
