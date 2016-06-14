'use strict';

var MetaInspector = require('node-metainspector');

var Trac = require('./trac');
var Gerrit = require('./gerrit');

var trac = new Trac();
var gerrit = new Gerrit();

// here be stuff about providing a link like in TracLinks
exports.getResponse = function (text, cb) {
    var tracUrl = trac.getUrl(text);
    if (tracUrl) {
        trac.getMessage(tracUrl, function (err, res) {
            if (err) throw err;
            cb(res);
        });
    }

    var gerritUrl = gerrit.getUrl(text);
    if (gerritUrl) {
        gerrit.getMessage(gerritUrl, function (err, res) {
            if (err) throw err;
            cb(res);
        });
    }
};
