# image-size-stream 

[![Build Status](https://travis-ci.org/shinnn/image-size-stream.svg)](https://travis-ci.org/shinnn/image-size-stream)
[![Build status](https://ci.appveyor.com/api/projects/status/y05fwx2rwnf1kdh6?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/image-size-stream)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/image-size-stream.svg?style=flat)](https://coveralls.io/r/shinnn/image-size-stream)
[![Dependency Status](https://david-dm.org/shinnn/image-size-stream.svg)](https://david-dm.org/shinnn/image-size-stream)
[![devDependency Status](https://david-dm.org/shinnn/image-size-stream/dev-status.svg)](https://david-dm.org/shinnn/image-size-stream#info=devDependencies)

Detect the width and height of images in a [stream](http://nodejs.org/api/stream.html)

```javascript
//       +-----------+
//       |           |
// 300px |  foo.jpg  |
//       |           |
//       +-----------+
//           400px 

var imageSizeStream = createImageSizeStream()
.on('size', function(dimensions) {
  dimensions; //=> {width: 400, height: 300, type: 'jpg'}
  stream.destroy();
});

var stream = fs.createReadStream('path/to/foo.jpg')
.pipe(imageSizeStream);
```

## Installation

[![NPM version](https://img.shields.io/npm/v/image-size-stream.svg?style=flat)](https://www.npmjs.com/package/image-size-stream)

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install --save image-size-stream
```

## Supported image formats

* [BMP](http://wikipedia.org/wiki/BMP_file_format)
* [GIF](http://wikipedia.org/wiki/Graphics_Interchange_Format)
* [JPEG](http://wikipedia.org/wiki/JPEG)
* [PNG](http://wikipedia.org/wiki/Portable_Network_Graphics)
* [PSD](http://wikipedia.org/wiki/Adobe_Photoshop#File_format)
* [SVG](http://wikipedia.org/wiki/Scalable_Vector_Graphics)
* [TIFF](http://wikipedia.org/wiki/Tagged_Image_File_Format)
* [WebP](http://wikipedia.org/wiki/WebP)
 
## API

### createImageSizeStream([*option*])

*option*: `Object`
Return: `Object` ([`stream.Transform`](http://nodejs.org/api/stream.html#stream_class_stream_transform))

The stream tries to detect the image size and emits [`size`](#size) or [`error`](#error) event.

```javascript
var createImageSizeStream = require('image-size-stream');
var imageSizeStream = createImageSizeStream();
```

#### option.limit

Type: `Number`  
Default: `128 * 1024`

Sets the maximum bytes the stream can reads. It emits an error if it cannot detect the image size even though it have reached the limit.

Usually the default value meets the requirements.

### Events

#### `size`

This event fires when the stream detect the image size. It passes an object in the form `{width: [Number], height: [Number], type: [String]}` to the callback function.

`type` will be one of the following strings: `bmp` `gif` `jpg` `png` `psd` `svg` `tiff` `webp`

```javascript
imageSizeStream.on('size', function(dimensions) {
  console.log('size: ' + dimensions.width + ' x ' + dimensions.height);
  console.log('image format: ' + dimensions.type);
});
```

#### `error`

This event fires when the stream failed to detect the image size. It passes an error to the callback function.

## Examples

These examples show that you don't need to read the image entirely if you just want to detect its width and height.

### Read data from local file system

```javascript
var fs = require('fs');
var fileStream = fs.createReadStream('path/to/image.jpg');

var createImageSizeStream = require('image-size-stream');
var size = createImageSizeStream();
size
.on('size', function(dimensions) {
  console.log(dimensions);
  fileStream.destroy();
})
.on('error', function(err) {
  throw err;
});

fileStream.pipe(size);
```

If you want to stop reading the rest of the image file at `size` event, call [fs.ReadStream.destroy()](https://github.com/joyent/node/blob/a5778cdf01425ae39cea80b62f9ec6740aec724a/lib/fs.js#L1587-L1594) or [fs.ReadStream.close()](https://github.com/joyent/node/blob/a5778cdf01425ae39cea80b62f9ec6740aec724a/lib/fs.js#L1597-L1620).

### Read data via HTTP

```javascript
var http = require('http');

var createImageSizeStream = require('image-size-stream');
var size = createImageSizeStream();
size
.on('size', function(dimensions) {
  console.log(dimensions);
  request.abort();
})
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

Licensed under [the MIT License](./LICENSE).
