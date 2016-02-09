'use strict';

var fs = require('fs'),
    path = require('path'),
    wrench = require('wrench'),
    chalk = require('chalk'),
    Dependo = require('dependo'),
    mkdirp = require('mkdirp');

/**
 * readRequireJSModules
 * @param  {Object} depObj
 */
function readRequireJSModules(depObj) {
    var files = wrench.readdirSyncRecursive(depObj.dirName).filter(depObj.returnJSfiles).filter(function(file) {
        return depObj.excludeFolders(file, depObj);
    });

    if (depObj.dirName) {
        files.forEach(function(file) {
            if (file.indexOf('.js') !== -1) {
                fs.readFile(depObj.dirName + '/' + file, 'utf-8', function(err, content) {
                    if (err) {
                        depObj.setError(err);
                    }
                    depObj.setResult(file, content, depObj);
                });
            }
        });
        depObj.generateDependo(files, depObj);
    }
}

/**
 * generateDependo
 * Show dependo result
 * @param  {String} file
 * @param  {Object} depObj
 */
function generateDependo(files, depObj) {
    var html, dependo;
    if (files.length > 0) {
        dependo = new Dependo(files, {
            format: 'amd',
            requireConfig: depObj.configFile,
            title: 'Project Depenedencies',
            exclude: '^node_modules',
            transform: function(dep) {
                var d;
                for (d in dep) {
                    if (dep[d] && dep[d].length > 0) {
                        chalk.blue(console.log('--> ' + d + ': ' + dep[d]));
                    }
                }
                return dep;
            }
        });
        html = dependo.generateHtml();
        depObj.exportHtml(html, depObj);
    } else {
        depObj.setError('No files to generate a report');
    }
}

/**
 * exportHtml
 * Generates an HTML file in the directory ./requirejsDeps
 * @param  {String} content [HTML content]
 * @param  {Object} depObj
 */
function exportHtml(content, depObj) {
    mkdirp('./requirejsDeps', function(err) {
        if (err) {
            depObj.setError(err);
        } else {
            fs.writeFile('./requirejsDeps/index.html', content, function(err) {
                if (err) depObj.setError(err);
            });
        }
    });
}

/**
 * setResult
 * Check that the module is created as a RequireJS module
 * @param {String} fileName   [file name]
 * @param {String} content    [file content]
 * @param {Object} depObj
 */
function setResult(fileName, content, depObj) {
    var depArr = {};
    if (content.indexOf('define(') !== -1 || content.indexOf('require(') !== -1) {
        depArr[fileName] = content;
    }
}

/**
 * setError
 * Show the error in console
 * @param {String} err [error text]
 */
function setError(err) {
    chalk.red(console.log(err));
}

/**
 * excludeFolders
 * method to exclude directories or files
 * @param  {String} file
 * @param  {Object} depObj
 * @return {String} file | false
 */
function excludeFolders(file, depObj) {
    return (depObj.foldersToExclude.length > 0 && depObj.foldersToExclude.indexOf(file) === -1) ? file : false;
}

/**
 * returnJSfiles
 * method that returns only js files
 * @param  {String} file
 * @return {String} file | false
 */
function returnJSfiles(file) {
    return (file.indexOf('.json') === -1 && file.indexOf('.jsq') === -1 && file.indexOf('node_modules') === -1 && file.indexOf('.git') === -1 && file.indexOf('coverage') === -1 && file.indexOf('.js') !== -1) ? file : false;
}

/**
 * module exports function
 * @param  {String} dirName [folfer name]
 * @param  {Array}  arr     [array of folders or files to exclude]
 * @param  {String} conf    [requirejs config file]
 */
module.exports = function(dirName, arr, conf) {
    var depObj = {
        dirName: dirName || path.resolve(__dirname),
        foldersToExclude: arr || [],
        configFile: conf || '',
        setResult: setResult,
        setError: setError,
        generateDependo: generateDependo,
        excludeFolders: excludeFolders,
        returnJSfiles: returnJSfiles,
        exportHtml: exportHtml
    };
    readRequireJSModules(depObj);
}
