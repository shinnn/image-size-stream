/*!
 * image-size-stream | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/image-size-stream
*/

'use strict';

var through = require('through');
var imageSize = require('image-size');

var LIMIT = 128 * 1024;

module.exports = function createImageSizeStream() {
  var buffer = new Buffer([]);
  var dimensions;
  var detectionError;
  
  return through(function write(chunk) {
    buffer = Buffer.concat([buffer, chunk]);
    if (!dimensions) {
      try {
        dimensions = imageSize(buffer);
      } catch (e) {
        detectionError = e;
        if (buffer.length > LIMIT) {
          this.emit('error', detectionError);
        }
      }
      if (dimensions) {
        this.emit('size', dimensions);
      }
    }
    this.queue(chunk);
  }, function end() {
    if (!dimensions) {
      this.emit('error', detectionError);
      return;
    }
    this.emit('end');
  });
};
