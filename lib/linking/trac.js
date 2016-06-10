'use strict';

var MetaInspector = require('node-metainspector');

var Trac = function Constructor() {
    this.request = {timeout: 5000, maxRedirects: 1};
};

module.exports = Trac;

Trac.prototype.getMessage = function (url, cb) {
    var processor = function(title) {
        return title.trim().split('\n')[0];
    };

    var client = new MetaInspector(url, this.request);

    client.on('fetch', function () {
        cb(null, {
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
        });
    });

    client.on('error', function (error) {
        cb(error);
    });

    client.fetch();
};
