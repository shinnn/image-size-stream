'use strict';

var assert = require('assert');
var fs = require('fs');
var http = require('http');

var parallel = require('run-parallel');
var imageSizeStream = require('..');

describe('imageSizeStream', function() {
  it('should have a function name.', function() {
    assert.equal(imageSizeStream.name, 'createImageSizeStream');
  });

  it('should detect the dimensions of an image.', function(done) {
    var req = http.get('http://placekitten.com/6000/4000', function(res) {
      res.pipe(imageSizeStream().on('size', function(dimensions) {
        req.abort();
        assert.deepEqual(dimensions, {
          width: 6000,
          height: 4000,
          type: 'jpg'
        });
        done();
      }));
    });
  });

  it('should emit `size` event before reading the image completely.', function(done) {
    var detected = false;
    var readLength = 0;
    var detectLength = 0;

    var imageSize = imageSizeStream()
    .on('data', function(chunk) {
      if (!detected) {
        detectLength += chunk.length;
      }
    })
    .on('size', function() {
      detected = true;
    });

    fs.createReadStream('test/fixture.webp', {highWaterMark: 1})
    .on('data', function(data) {
      readLength += data.length;
    })
    .on('end', function() {
      assert(detectLength < readLength);
      done();
    })
    .pipe(imageSize);
  });

  it('should be able to create multiple streams at the same time.', function(done) {
    parallel([
      function(cb) {
        var stream = fs.createReadStream('test/fixture-another.png');
        stream.pipe(imageSizeStream().on('size', function(dimensions) {
          stream.destroy();
          cb(null, dimensions);
        }).on('error', cb));
      },
      function(cb) {
        var req = http.get('http://placekitten.com/4000/6000', function(res) {
          res.pipe(imageSizeStream().on('size', function(dimensions) {
            req.abort();
            cb(null, dimensions);
          }).on('error', cb));
        });
      }
    ], function(err, results) {
      assert.strictEqual(err, null);
      assert.deepEqual(results, [
        {
          width: 673,
          height: 506,
          type: 'png'
        },
        {
          width: 4000,
          height: 6000,
          type: 'jpg'
        }
      ]);
      done();
    });
  });

  it('should emit a type error when it receives non-image data', function(done) {
    imageSizeStream()
    .on('error', function(err) {
      assert.equal(err.name, 'TypeError');
      assert.equal(err.message, 'unsupported file type');
      done();
    })
    .end(' ');
  });

  it('should emit a type error when it receives large non-image data', function(done) {
    var stream = imageSizeStream()
    .on('error', function(err) {
      assert.equal(err.name, 'TypeError');
      assert.equal(err.message, 'unsupported file type');
      done();
    });

    var i = 9999;

    while (i--) {
      stream.write(new Buffer('   '));
    }

    stream.end(new Buffer('   '));
  });

  it('should pass a type error when the image is corrupted.', function(done) {
    var stream = fs.createReadStream('test/fixture-broken.jpg');
    stream.pipe(imageSizeStream().on('error', function(err) {
      stream.destroy();
      assert.equal(err.name, 'TypeError');
      assert.ok(/Invalid JPG/.test(err.message));
      done();
    }));
  });

  it('should pass an error when it receives no bytes', function(done) {
    imageSizeStream()
    .on('error', function(err) {
      assert.equal(err.name, 'Error');
      assert.equal(err.message, 'No bytes received.');
      done();
    })
    .end('');
  });

  it('should use `limit` option to specify maximum file size.', function(done) {
    fs.createReadStream(__filename)
    .pipe(imageSizeStream({limit: 1})
    .on('error', function(err) {
      assert.equal(err.name, 'Error');
      assert.equal(err.message, 'Reached the limit before detecting image type.');
      done();
    }));
  });

  it('should throw a type error when `limit` option is not a number.', function() {
    assert.throws(
      imageSizeStream.bind(null, {limit: 'one hundred'}),
      /TypeError.*one hundred .*must be a number/
    );
  });
});
