var fs = require('fs'),
    path = require('path'),
    wrench = require('wrench'),
    chalk = require('chalk'),
    Dependo = require('dependo'),
    foldersToExclude,
    configFile;

/**
 * excludeFolders
 * method to exclude directories or files
 * @param  {string} file
 * @return {string}
 */
function excludeFolders(file) {
    var result = false;

    foldersToExclude.map(function(f) {
        (file.indexOf(f) === -1 && !result) ? result = file: result = false;
    });
    return (result) ? result : false;
}

/**
 * returnJSfiles
 * method that returns only js files
 * @param  {string} file
 * @return {string}
 */
function returnJSfiles(file) {
    return (file.indexOf('.json') === -1 && file.indexOf('.jsq') === -1 && file.indexOf('node_modules') === -1 && file.indexOf('.git') === -1 && file.indexOf('.js') !== -1) ? file : false;
}

/**
 * readRequireJSModules
 * @param  {string} dirName   [folfer name]
 * @param  {array}  arr       [array of folders or files to exclude]
 * @param  {object} setResult [setResult method]
 * @param  {object} onError   [setError method]
 */
function readRequireJSModules(dirName, arr, setResult, onError) {
    var files = wrench.readdirSyncRecursive(dirName).filter(returnJSfiles).filter(excludeFolders);

    if (dirName) {
        files.forEach(function(file) {
            if (file.indexOf('.js') !== -1) {
                fs.readFile(dirName + '/' + file, 'utf-8', function(err, content) {
                    if (err) {
                        onError(err);
                        return;
                    }
                    setResult(file, content);
                });
            }
        });
    }
}

/**
 * generateDependo
 * Show dependo result
 * @param  {string} file
 */
function generateDependo(file) {
    if (file) {
        var dependo = new Dependo(file, {
            format: 'amd',
            requireConfig: configFile,
            transform: function(dep) {
                for (d in dep) {
                    if (dep.hasOwnProperty(d)) {
                        if (dep[d].length > 0) {
                            chalk.blue(console.log('--> ' + d + ': ' + dep[d]));
                        }
                    }
                }
            }
        });
        dependo.generateHtml();
    }
}

/**
 * setResult
 * Check that the module is created as a RequireJS module
 * @param {string} fileName
 * @param {string} content  [file content]
 */
function setResult(fileName, content) {
    if (content.indexOf('define(') !== -1 || content.indexOf('require(') !== -1) {
        generateDependo(fileName);
    }
}

/**
 * setError
 * Show the error in console
 * @param {string} err [error text]
 */
function setError(err) {
    chalk.red(console.log(err));
}

/**
 * @param  {string} dirName [folfer name]
 * @param  {array}  arr     [array of folders or files to exclude]
 * @param  {string} conf    [requirejs config file]
 */
module.exports = function(dirName, arr, conf) {
    var dir = dirName || path.resolve(__dirname);
    foldersToExclude = arr;
    configFile = conf;
    readRequireJSModules(dir, arr, setResult, setError);
}
