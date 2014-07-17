'use strict';

var assert = require('assert');
var fs = require('fs');
var http = require('http');

var concatStream = require('concat-stream');
var parallel = require('run-parallel');

var imageSizeStream = require('require-main')();

describe('imageSizeStream', () => {
  it('should detect the dimensions of an image.', done => {
    let stream = fs.createReadStream('test/fixture.png');
    stream.pipe(imageSizeStream().on('size', dimensions => {
      stream.destroy();
      assert.deepEqual(dimensions, {width: 673, height: 506});
      done();
    }));
  });

  it('should detect the dimensions of an image via http.', done => {
    let req = http.get('http://placekitten.com/6000/4000', res => {
      res.pipe(imageSizeStream().on('size', dimensions => {
        req.abort();
        assert.deepEqual(dimensions, {width: 6000, height: 4000});
        done();
      }));
    });
  });

  it('should pass an type error when the image is corrupted.', done => {
    let stream = fs.createReadStream('test/fixture-broken.jpg');
    stream.pipe(imageSizeStream().on('error', err => {
      stream.destroy();
      assert.throws(() => assert.ifError(err), TypeError);
      done();
    }));
  });

  it('should pass an error when it doesn\'t receive any bytes', done => {
    let stream = fs.createReadStream('test/fixture-empty.txt');
    stream.pipe(imageSizeStream().on('error', err => {
      stream.destroy();
      assert.throws(() => assert.ifError(err), 'No bytes received.');
      done();
    }));
  });

  it('should emit an error event before reading the image completely.', done => {
    let buffer = new Buffer([]);
    let detected = false;

    let imageSize = imageSizeStream()
    .on('data', chunk => {
      if (!detected) {
        buffer = Buffer.concat([buffer, chunk]);
      }
    })
    .on('size', () => detected = true);

    let concat = concatStream({encoding: 'buffer'}, data => {
      assert(data.length > buffer.length);
      done();
    });
    
    fs.createReadStream('test/fixture-another.webp', {highWaterMark: 1})
    .pipe(imageSize).pipe(concat);
  });

  it('should run concurrently when more than one stream is created.', done => {
    let stream = fs.createReadStream('test/fixture.png');

    parallel([
      cb => {
        stream.pipe(imageSizeStream().on('size', dimensions => {
          stream.destroy();
          cb(null, dimensions);
        }).on('error', err => cb(err)));
      },
      cb => {
        let req = http.get('http://placekitten.com/4000/6000', res => {
          res.pipe(imageSizeStream().on('size', dimensions => {
            req.abort();
            cb(null, dimensions);
          }).on('error', err => cb(err)));
        });
      }
    ], (err, results) => {
      if (err) {
        done(err);
        return;
      }
      assert.deepEqual(results[0], {width: 673, height: 506});
      assert.deepEqual(results[1], {width: 4000, height: 6000});
      done();
    });
  });
});
