/*!
 * ENDER - The open module JavaScript framework
 *
 * Copyright (c) 2011-2012 @ded, @fat, @rvagg and other contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


/******************************************************************************
 * A simple utility to write out the source files, both plain and minified.
 * The source comes from a SourceBuild object which has an asString() method
 * to pull together the component parts.
 */

var fs              = require('fs')
  , async           = require('async')
  , FilesystemError = require('errno').custom.FilesystemError

var getOutputFilenameFromOptions = function (options) {
      return options.output ? options.output.replace(/(\.js)?$/, '.js') : 'ender.js'
    }

  , writeFile = function (file, callback, err, data) {
      if (err) return callback(err) // wrapped in source-build.js
      fs.writeFile(file, data, 'utf-8', function (err) {
        if (err) return callback(new FilesystemError(err))
        callback(null, file)
      })
    }

  , writePlainFile = function (options, sourceBuild, callback) {
      var filename = getOutputFilenameFromOptions(options)
      sourceBuild.asString({ type: 'plain' }, writeFile.bind(null, filename, callback))
    }

  , writeMinifiedFile = function (options, sourceBuild, callback) {
      var filename = getOutputFilenameFromOptions(options).replace(/(\.min)?\.js/, '.min.js')
      sourceBuild.asString({ type: 'minified' }, writeFile.bind(null, filename, callback))
    }

  , write = function (options, sourceBuild, callback) {
      var jobs = [ writePlainFile.bind(null, options, sourceBuild) ]
      if (options.minifier != 'none')
        jobs.push(writeMinifiedFile.bind(null, options, sourceBuild))

      async.parallel(jobs, function (err, results) {
        if (err) return callback(err)
        callback(null, results[0])
      })
    }

module.exports.write = write