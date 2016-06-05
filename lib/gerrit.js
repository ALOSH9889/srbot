'use strict';

var util = require('util');
var Messager = require('./messager');
var MetaInspector = require('node-metainspector');

var Gerrit = function Constructor() {
    this.request = {timeout: 5000, maxRedirects: 1};
};

util.inherits(Gerrit, Messager);

module.exports = Gerrit;

Gerrit.prototype.getMessage = function (url, cb) {
    var processor = function(title) {
        return title.split('|')[0].trim();
    };
    Gerrit.super_.prototype.getMessage(url, processor, cb);
}
