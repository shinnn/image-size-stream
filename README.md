# image-size-stream 

[![NPM version](https://img.shields.io/npm/v/image-size-stream.svg)](https://www.npmjs.com/package/image-size-stream)
[![Build Status](https://travis-ci.org/shinnn/image-size-stream.svg)](https://travis-ci.org/shinnn/image-size-stream)
[![Build status](https://ci.appveyor.com/api/projects/status/y05fwx2rwnf1kdh6?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/image-size-stream)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/image-size-stream.svg)](https://coveralls.io/r/shinnn/image-size-stream)
[![Dependency Status](https://img.shields.io/david/shinnn/image-size-stream.svg?label=deps)](https://david-dm.org/shinnn/image-size-stream)
[![devDependency Status](https://img.shields.io/david/dev/shinnn/image-size-stream.svg?label=devDeps)](https://david-dm.org/shinnn/image-size-stream#info=devDependencies)

Detect the width and height of images in a [stream](https://nodejs.org/api/stream.html)

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

var stream = fs.createReadStream('path/to/foo.jpg').pipe(imageSizeStream);
```

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install --save image-size-stream
```

## Supported image formats

* [BMP](https://wikipedia.org/wiki/BMP_file_format)
* [GIF](https://wikipedia.org/wiki/Graphics_Interchange_Format)
* [JPEG](https://wikipedia.org/wiki/JPEG)
* [PNG](https://wikipedia.org/wiki/Portable_Network_Graphics)
* [PSD](https://wikipedia.org/wiki/Adobe_Photoshop#File_format)
* [SVG](https://wikipedia.org/wiki/Scalable_Vector_Graphics)
* [TIFF](https://wikipedia.org/wiki/Tagged_Image_File_Format)
* [WebP](https://wikipedia.org/wiki/WebP)
 
## API

```javascript
var createImageSizeStream = require('image-size-stream');
```

### createImageSizeStream([*option*])

*option*: `Object`  
Return: `Object` ([`stream.Transform`](https://nodejs.org/api/stream.html#stream_class_stream_transform))

The stream tries to detect the image size and emits [`size`](#size) or [`error`](#error) event.

```javascript
var createImageSizeStream = require('image-size-stream');
var imageSizeStream = createImageSizeStream();
```

#### option.limit

Type: `Number`  
Default: `128 * 1024`

The maximum bytes the stream can reads. It emits an error if it cannot detect the image size though it has reached the limit.

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

If you want to stop reading the rest of the image file at `size` event, call [fs.ReadStream#destroy()](https://github.com/joyent/node/blob/ef4344311e19a4f73c031508252b21712b22fe8a/lib/fs.js#L1691-L1698) or [fs.ReadStream#close()](https://github.com/joyent/node/blob/ef4344311e19a4f73c031508252b21712b22fe8a/lib/fs.js#L1701-L1724).

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

If you want to stop loading the rest of the image file at `size` event, call [request.abort()](https://nodejs.org/api/http.html#http_request_abort).

## License

Copyright (c) 2014 - 2015 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
