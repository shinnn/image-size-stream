# image-size-stream 

[![NPM version](https://badge.fury.io/js/image-size-stream.svg)](http://badge.fury.io/js/image-size-stream)
[![Build Status](https://travis-ci.org/shinnn/image-size-stream.svg?branch=master)](https://travis-ci.org/shinnn/image-size-stream)
[![Dependency Status](https://david-dm.org/shinnn/image-size-stream.svg)](https://david-dm.org/shinnn/image-size-stream)
[![devDependency Status](https://david-dm.org/shinnn/image-size-stream/dev-status.svg)](https://david-dm.org/shinnn/image-size-stream#info=devDependencies)

Detect the width and height of an image in a [stream](http://nodejs.org/api/stream.html), using [image-size](https://github.com/netroy/image-size)

```javascript
//       +-----------+
//       |           |
// 300px |  foo.jpg  |
//       |           |
//       +-----------+
//           400px 

var imageSizeStream = createImageSizeStream();
imageSizeStream.on('size', function(dimensions) {
  console.log(dimensions);
  fsReadStream.destroy();
});

fsReadStream.pipe(imageSizeStream);

//=> yields: {width: 400, height: 300}
```

## Installation

[Install with npm](https://www.npmjs.org/doc/cli/npm-install.html). (Make sure you have installed [Node](http://nodejs.org/))

```
npm install --save image-size-stream
```

## Supported image formats

* [BMP](http://wikipedia.org/wiki/BMP_file_format)
* [GIF](http://wikipedia.org/wiki/Graphics_Interchange_Format)
* [JPEG](http://wikipedia.org/wiki/JPEG)
* [PNG](http://wikipedia.org/wiki/Portable_Network_Graphics)
* [PSD](http://wikipedia.org/wiki/Adobe_Photoshop#File_format)
* [TIFF](http://wikipedia.org/wiki/Tagged_Image_File_Format)
* [WebP](http://wikipedia.org/wiki/WebP)

## API

### createImageSizeStream()

Return: `Stream`

The stream tries to detect the image size and emits `size` or `error` event.

```javascript
var createImageSizeStream = require('image-size-stream');
var imageSizeStream = createImageSizeStream();
```

### Events

#### `size`

This event fires when the stream detect the image size. It passes an `Object` of the form `{width: [Number], height: [Number]}` to the callback function.

```javascript
imageSizeStream.on('size', function(dimensions) {
  console.log('size: ' + dimensions.width + ' x ' + dimensions.height);
});
```

#### `error`

This event fires when the stream failed to detect the image size. It passes an `TypeError` to the callback function.

## Examples

These examples shows that you don't need to read the image entirely if you just want to detect its width and height.

### Read from local file system

```javascript
var fs = require('fs');
var fileStream = fs.createReadStream('path/to/foo.jpg');

var createImageSizeStream = require('image-size-stream');
var size = createImageSizeStream();
size
.on('size', function(dimensions) {
  console.log(dimensions);
  fileStream.destroy();
});
.on('error', function(err) {
  throw err;
});

fileStream.pipe(size);
```

If you want to stop reading the rest of the image file at `size` event, call [fs.ReadStream.destroy()](https://github.com/joyent/node/blob/03e9f84933fe610b04b107cf1f83d17485e8906e/lib/fs.js#L1578-L1585) or [fs.ReadStream.close()](https://github.com/joyent/node/blob/03e9f84933fe610b04b107cf1f83d17485e8906e/lib/fs.js#L1588-L1611).

### Read via HTTP

```javascript
var http = require('http');

var createImageSizeStream = require('image-size-stream');
var size = createImageSizeStream();
size
.on('size', function(dimensions) {
  console.log(dimensions);
  request.abort();
});
.on('error', function(err) {
  throw err;
});

var request = http.get('url/to/image.png', function(response) {
  response.pipe(size);
});
```

If you want to stop loading the rest of the image file at `size` event, call [request.abort()](http://nodejs.org/api/http.html#http_request_abort).

## License

Copyright (c) 2014 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT LIcense](./LICENSE).
