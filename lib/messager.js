'use strict';

var MetaInspector = require('node-metainspector');

var Messager = function Constructor() {
    this.request = {timeout: 5000, maxRedirects: 1};
};

module.exports = Messager;

Messager.prototype.getMessage = function (url, titleProcess, cb) {
    var client = new MetaInspector(url, this.request);

    client.on('fetch', function () {
        var title = '<' + url + '|' + titleProcess(client.title) + '>';
        cb(null, title);
    });
    client.on('error', function (error) {
        cb(error);
    });
    client.fetch();
};
