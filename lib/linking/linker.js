'use strict';

var MetaInspector = require('node-metainspector');

var Trac = require('./trac');
var Gerrit = require('./gerrit');

var tracRoot = 'https://studentrobotics.org/trac';
var gerritRoot = 'https://studentrobotics.org/gerrit';

var tracRe = /(trac|t):(\d+)/i;
var gerritRe = /(gerrit|ger|g):(\d+)/i;

// here be stuff about providing a link like in TracLinks
exports.getResponse = function (text, cb) {
    var tracMatch = tracRe.exec(text);
    var gerritMatch = gerritRe.exec(text);

    if (tracMatch) {
        console.log('Found a something to do with Trac that needs linking.');

        var url = tracRoot + '/ticket/' + tracMatch[2];
        var client = new MetaInspector(url, {timeout: 5000, maxRedirects: 1});

        var trac = new Trac();
        trac.getMessage(url, function (err, message) {
            if (err) {
                throw err;
            }
            cb(message);
        });
    } else if (gerritMatch) {
        console.log('Found something to do with Gerrit that needs linking.');

        var url = gerritRoot + '/#/c/' + gerritMatch[2];
        var gerrit = new Gerrit();
        gerrit.getMessage(url, gerritMatch[2], function (err, message) {
            cb(message);
        });
    }
    return null;
};
