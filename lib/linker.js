'use strict';

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
        var url = tracRoot + '/ticket/' + tracMatch[2];
        var trac = new Trac();
        trac.getMessage(url, function (err, title) {
            if (err) throw err;
            cb(title);
        });
    } else if (gerritMatch) {
        var url = gerritRoot + '/#/c/' + gerritMatch[2];
        cb(url);
    }
    return null;
};
