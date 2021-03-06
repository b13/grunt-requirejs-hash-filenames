# grunt-requirejs-hash-filenames

> Add hash to each filename and update RequireJs config to load those 'new' files. This task should be used after r.js optimization / 'production js build' is done.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-requirejs-hash-filenames --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-requirejs-hash-filenames');
```

## The "requirejsHashFiles" task

### Overview
In your project's Gruntfile, add a section named `requirejsHashFiles` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
    requirejsHashFiles: {
        options: {
            task: {
                // append hash to each file
                // use pathTofile/**/*.js to also parse subfolders
                files: ['pathTofile/*.js'],

                // exclude files
                excludeFiles: ['pathToExcludedFile/file']

                // path to main requirejs file (included in html header)
                requireJsMainConfigFile: 'pathToRequireJsMainConfigFile/common.js',

                // replace path(s) to new main requirejs file
                replaceRequireJsMainConfigFilePaths: ['replaceRequireJsMainConfigFilePaths/index.html'],

                // if you want to use requirejs namespace, see: http://www.requirejs.org/docs/faq-optimization.html#namespace
                requirejsNamespace: ''
            }
        }
    }
});
```

## Release History
* Add exclude file option
* Add support to hash js files in subfolder
* Big bang
