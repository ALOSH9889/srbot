'use strict';

var Gerrit = function Constructor() {
    this.request = {timeout: 5000, maxRedirects: 1};
};

var gerritRoot = 'https://studentrobotics.org/gerrit';
var gerritRe = /((g(er(rit)?)?)[\:\s]*)(\d+)/i;

module.exports = Gerrit;

Gerrit.prototype.getUrl = function (text) {
    var gerritMatch = gerritRe.exec(text);
    var url;
    if (gerritMatch) {
        url = gerritRoot + '/#/c/' + gerritMatch[5].toString();
    }
    return url;
};

Gerrit.prototype.getMessage = function (url, cb) {
    var code = /([0-9]+)/.exec(url);
    if (url && code) {
        code = code[1];
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
    } else {
        cb(null, null);
    }

}
