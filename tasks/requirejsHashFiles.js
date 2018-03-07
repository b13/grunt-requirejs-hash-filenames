/*
 * grunt-requirejs-hash-filenames
 * https://github.com/b13/grunt-requirejs-hash-filenames
 *
 * Copyright (c) 2017 Daniel Sattler
 * Licensed under the MIT license.
 */

'use strict';

var crypto = require('crypto');
var fs = require('fs');
var path = require('path');


module.exports = function (grunt) {

	// create file hash
	var createHash = function (filepath, algorithm, fileEncoding) {
		var hash = crypto.createHash(algorithm);
		grunt.log.verbose.write('Calculating hashsum of ' + filepath + '...');
		hash.update(grunt.file.read(filepath), fileEncoding);
		return hash.digest('hex');
	};


	grunt.registerTask('requirejsHashFiles', 'Add hash to each js filename and update RequireJs config to load those files', function () {

		var jsMap = {};
		var options = this.options({
			punctuation: '.',
			algorithm: 'md5',
			encoding: 'utf8',
			length: 8,
			separator: '-',
			js: {
				requireJsMainConfigFile: '',
				requireJsMainConfigFileOriginal: '',
				replaceRequireJsMainConfigFilePaths: [],
				excludeFiles: [],
				requirejsNamespace: ''
			}
		});

		// store path to js original file names
		var originalJSFiles = grunt.file.expand(options.js.files);
		options.js.requireJsMainConfigFileOriginal = options.js.requireJsMainConfigFile;
		var requireJsBasePath = path.dirname(options.js.requireJsMainConfigFile);

		// add hash to filename
		originalJSFiles.forEach(function (filename) {
			var dest = path.dirname(filename);
			var hash = createHash(filename, options.algorithm, options.encoding).slice(0, options.length);
			var ext = path.extname(filename);
			var new_name = [path.basename(filename, ext), hash].join(options.separator) + ext;
			var outPath;
			var relPath;

			// check if file is excluded
			if (options.js.excludeFiles && options.js.excludeFiles.indexOf(filename) !== -1) {
				grunt.log.writeln("\n" + '✔ '.green + "Don't add hash to file: " + filename);
				return false;
			}

			if (filename.match(hash)) {

				grunt.log.fail("filename are already hashed!");

			} else {

				// rename files
				relPath = [path.dirname(filename), new_name].join('/');
				outPath = path.resolve(path.dirname(filename), new_name);
				fs.renameSync(filename, outPath);
				grunt.log.writeln('✔ '.green + filename + (' renamed to ').grey + relPath);

				// get relative path to file (base: option.requireJsMainConfigFile)
				var relativeDestPath = "";
				if (requireJsBasePath !== dest) {
					relativeDestPath = path.relative(requireJsBasePath, dest) + "/";
				}

				// update requirejs define
				var content = grunt.file.read(relPath);
				var regex = "define\\((\"|\')" + relativeDestPath.replace(/\//g, "\\/") + path.basename(filename, ext) + "(\"|\')";
				var r = new RegExp(regex, "g");
				if (content.search(r) !== -1) {
					content = content.replace(r, "define(\"" + relativeDestPath + path.basename(new_name, ext) + "\"");
					grunt.file.write(relPath, content);
				}

				// create requirejs map
				jsMap[relativeDestPath + path.basename(filename, ext)] = relativeDestPath + path.basename(new_name, ext);
				if (filename.match(options.js.requireJsMainConfigFile)) {
					options.js.requireJsMainConfigFile = relPath;
				}
			}
		});

		// create requirejs config map
		var requireMapConfig = options.js.requirejsNamespace && options.js.requirejsNamespace.length > 0 ? options.js.requirejsNamespace + "." : "";
		requireMapConfig += "requirejs.config({ map: " + JSON.stringify({'*': jsMap}) + " });";

		// add requirejs config mapping to main commen file
		var commonJsContent = grunt.file.read(options.js.requireJsMainConfigFile);
		if (commonJsContent) {
			grunt.file.write(options.js.requireJsMainConfigFile, commonJsContent + "\n" + requireMapConfig);
			grunt.log.writeln("\n" + '✔ '.green + "Append new RequireJs path mapping " + '('.gray + options.js.requireJsMainConfigFile.gray + ')'.gray);

			// make sure to update common file hash after requirejs config mapping is added
			var commonJsHash = createHash(options.js.requireJsMainConfigFile, options.algorithm, options.encoding).slice(0, options.length);
			var commonJsExt = path.extname(options.js.requireJsMainConfigFile);
			var newCommonJsFileName = [path.basename(options.js.requireJsMainConfigFileOriginal, commonJsExt), commonJsHash].join(options.separator) + commonJsExt;
			var newCommonJsFileNameRelPath = [path.dirname(options.js.requireJsMainConfigFileOriginal), newCommonJsFileName].join('/');

			// rename require js main config file
			var newCommonJsFileNameOutPath = path.resolve(path.dirname(options.js.requireJsMainConfigFile), newCommonJsFileName);
			fs.renameSync(options.js.requireJsMainConfigFile, newCommonJsFileNameOutPath);
			grunt.log.writeln('✔ '.green + options.js.requireJsMainConfigFile + (' renamed to ').grey + newCommonJsFileNameRelPath);

			grunt.log.writeln("\n" + '✔ '.green + "Update require js main config file hash " + '('.gray + options.js.requireJsMainConfigFile.gray + ' -> ' + newCommonJsFileNameRelPath.gray + ')'.gray);
			options.js.requireJsMainConfigFile = newCommonJsFileNameRelPath;
		}

		// replace path to common main file with hashed one
		// from:
		// <script data-main="somePath/JavaScript/" src="/somePath/JavaScript/common.js"></script>
		// to:
		// <script data-main="somePath/JavaScript/" src="/somePath/Public/JavaScript/common-5017e000.js"></script>
		var _mainConfigFile = options.js.requireJsMainConfigFileOriginal;
		options.js.replaceRequireJsMainConfigFilePaths.forEach(function (filename) {
			var content = grunt.file.read(filename);
			if (content) {
				var regex = _mainConfigFile.substring(0, _mainConfigFile.lastIndexOf('.')) + "\\S{0," + (options.length + options.separator.length) + "}.js";
				var r = new RegExp(regex, "g");
				content = content.replace(r, options.js.requireJsMainConfigFile);
				grunt.file.write(filename, content);
				grunt.log.writeln("\n" + '✔ '.green + "Update path to hashed requirejs main config file " + '('.gray + filename.gray + ')'.gray);
			}
		});
	});
};
