'use strict';

var MetaInspector = require('node-metainspector');

var Trac = function Constructor() {
    this.request = {timeout: 5000, maxRedirects: 1};
};

var tracRoot = 'https://studentrobotics.org/trac';
var tracRe = /((t(rac)?|ticket)[\:\s]*)(\d+)/i;

module.exports = Trac;

Trac.prototype.getUrl = function (text) {
    var tracMatch = tracRe.exec(text);
    var url;
    if (tracMatch) {
        url = tracRoot + '/ticket/' + tracMatch[4];
    }
    return url;
}

//TODO: more information about fetched links

Trac.prototype.getMessage = function (url, cb) {
    var processor = function(title) {
        return title.trim().split('\n')[0];
    };

    var client = new MetaInspector(url, this.request);

    client.on('fetch', function () {
        var pld = {
            "attachments": [
                {
                    "title": processor(client.title),
                    "pretext": url,
                    "text": url,
                    "mrkdwn_in": [
                        "text",
                        "pretext"
                    ]
                }
            ]
        };
        console.log('pld is: ' + pld);
        cb(null, pld);
    });

    client.on('error', function (error) {
        cb(error);
    });

    client.fetch();
};
