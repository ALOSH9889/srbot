'use strict';

var util = require('util');
var Messager = require('./messager');
var MetaInspector = require('node-metainspector');

var Trac = function Constructor() {
    this.request = {timeout: 5000, maxRedirects: 1};
};

util.inherits(Trac, Messager);

module.exports = Trac;

Trac.prototype.getMessage = function (url, cb) {
    var processor = function(title) {
        return title.trim().split('\n')[0];
    };
    Trac.super_.prototype.getMessage(url, processor, cb);
}
