/*!
 * image-size-stream | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/image-size-stream
*/
'use strict';

var PassThrough = require('readable-stream').PassThrough;
var tryit = require('tryit');
var imageSize = require('image-size');

var DEFAULT_LIMIT = 128 * 1024;

module.exports = function createImageSizeStream(option) {
  option = option || {};
  if (option.limit !== undefined) {
    if (typeof option.limit !== 'number') {
      throw new TypeError(
        option.limit +
        ' is not a number. `limit` option must be a number.'
      );
    }
  } else {
    option.limit = DEFAULT_LIMIT;
  }

  var buffer = new Buffer(0);
  var len = 0;
  var dimensions;
  var detectionError;

  return new PassThrough()
    .on('data', function detectImageSize(chunk) {
      if (!dimensions) {
        len += chunk.length;
        buffer = Buffer.concat([buffer, chunk], len);

        tryit(function() {
          dimensions = imageSize(buffer);
        }, function(err) {
          detectionError = err;
        });

        if (dimensions) {
          this.emit('size', dimensions);
        } else if (len > option.limit) {
          this.emit('error', new Error('Reached the limit before detecting image type.'));
        }
      }
    })
    .on('finish', function flush() {
      if (dimensions) {
        return;
      }

      if (buffer.length === 0) {
        this.emit('error', new Error('No bytes received.'));
        return;
      }

      this.emit('error', detectionError);
    });
};
