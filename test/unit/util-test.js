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


var buster = require('buster')
  , assert = buster.assert
  , fs = require('fs')
  , util = require('../../lib/util')
  , FilesystemError = require('../../lib/errors').FilesystemError

  , verifyWritable = function (name, dir, done) {
      fs.exists(dir, function (exists) {
        if (!exists) {
          assert.fail(name + ' directory doesn\'t exist:: ' + dir)
          done()
        } else {
          var tmpFile = dir + '/ender_test.' + (+new Date())
          fs.writeFile(tmpFile, 'Test data', function (err) {
            if (err) {
              assert.fail('couldn\'t write to ' + name + ' file: ' + tmpFile)
                done()
            } else {
              fs.unlink(tmpFile, function (err) {
                if (err)
                  assert.fail('couldn\'t delete ' + name + ' file: ' + tmpFile)
                done()
              })
            }
          })
        }
      })
    }

buster.testCase('Util', {
    'directories': {
        'test util.tmp is a writeable directory': function (done) {
          assert.isString(util.tmpDir)
          verifyWritable('temp', util.tmpDir, done)
        }

      , 'test util.home is a writeable directory': function (done) {
          assert.isString(util.homeDir)
          verifyWritable('home', util.homeDir, done)
        }
    }

  , 'extend': {
        'test basic extend()': function () {
          var src = { 'one': 1, 'two': 2 }
            , dst = { 'two': 2.2, 'three': 3 }

            , actual = util.extend(src, dst)

          assert.same(actual, dst) // the return is just a convenience

          assert.equals(Object.keys(actual).length, 3)
          assert.equals(actual.one, src.one)
          assert.equals(actual.two, 2.2) // didn't overwrite existing property
          assert.equals(actual.three, 3)

          // left src untouched?
          assert.equals(Object.keys(src).length, 2)
          assert.equals(src.one, 1)
          assert.equals(src.two, 2)
        }
    }

  , 'mkdir': {
        'test mkdir nonexistant': function (done) {
          var dir = '/tmp/' + Math.random() + '.' + process.pid + '.test'
          util.mkdir(dir, function (err) {
            refute(err, 'no error from mkdir()')
            fs.exists(dir + '/', function (exists) {
              assert(exists, 'directory exists')
              fs.rmdir(dir, done)
            })
          })
        }

      , 'test mkdir already exists': function (done) {
          var dir = '/tmp/' + Math.random() + '.' + process.pid + '.test'
          fs.mkdir(dir, function (err) {
            refute(err, 'no error from fs.mkdir()')
            util.mkdir(dir, function (err) {
              refute(err, 'no error from mkdir()')
              fs.exists(dir + '/', function (exists) {
                assert(exists, 'directory exists')
                fs.rmdir(dir, done)
              })
            })
          })
        }

      , 'test mkdir error': function (done) {
          var fsMock = this.mock(fs)
            , errArg = new Error('this is an error')

          fsMock.expects('mkdir').callsArgWith(1, errArg)
          util.mkdir('foobar', function (err) {
            assert(err)
            assert(err instanceof FilesystemError)
            assert.same(err.cause, errArg)
            assert.same(err.message, errArg.message)
            done()
          })
        }
    }
})