'use strict';

var Gerrit = function Constructor() {
    this.request = {timeout: 5000, maxRedirects: 1};
};

module.exports = Gerrit;

Gerrit.prototype.getMessage = function (url, code, cb) {
    cb(null, {
        "attachments": [
            {
                "title": "Gerrit #" + code,
                "pretext": url,
                "text": url,
                "mrkdwn_in": [
                    "text",
                    "pretext"
                ]
            }
        ]
    });
}
