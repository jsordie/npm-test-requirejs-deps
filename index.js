var fs = require('fs'),
    path = require('path'),
    wrench = require('wrench'),
    chalk = require('chalk'),
    Dependo = require('dependo'),
    mkdirp = require('mkdirp'),
    foldersToExclude,
    configFile;

/**
 * readRequireJSModules
 * @param  {String} dirName     [folfer name]
 * @param  {Array}  arr         [array of folders or files to exclude]
 * @param  {Function} setResult [setResult method]
 * @param  {Function} setError  [setError method]
 * @param  {Function} generateDependo [generateDependo method]
 */
function readRequireJSModules(dirName, arr, setResult, setError, generateDependo) {
    var files = wrench.readdirSyncRecursive(dirName).filter(returnJSfiles).filter(excludeFolders);

    if (dirName) {
        files.forEach(function(file) {
            if (file.indexOf('.js') !== -1) {
                fs.readFile(dirName + '/' + file, 'utf-8', function(err, content) {
                    if (err) {
                        setError(err);
                    }
                    setResult(file, content, setError);
                });
            }
        });
        generateDependo(files);
    }
}

/**
 * generateDependo
 * Show dependo result
 * @param  {String} file
 */
function generateDependo(files) {
    var html, dependo;
    if (files.length > 0) {
        dependo = new Dependo(files, {
            format: 'amd',
            requireConfig: configFile,
            title: 'Project Depenedencies',
            exclude: '^node_modules',
            transform: function(dep) {
                for (d in dep) {
                    if (dep[d] && dep[d].length > 0) {
                        chalk.blue(console.log('--> ' + d + ': ' + dep[d]));
                    }
                }
                return dep;
            }
        });
    }
    html = dependo.generateHtml();
    exportHtml(html, setError);
}

/**
 * exportHtml
 * Generates an HTML file in the directory ./requirejsDeps
 * @param  {String} content [HTML content]
 * @param  {Function} setError [setError method]
 */
function exportHtml(content, setError) {
    mkdirp('./requirejsDeps', function(err) {
        if (err) {
            setError(err);
        } else {
            fs.writeFile('./requirejsDeps/index.html', content, function(err) {
                if (err) setError(err);
            });
        }
    });
}

/**
 * setResult
 * Check that the module is created as a RequireJS module
 * @param {String} fileName   [file name]
 * @param {String} content    [file content]
 * @param {Function} callback [generateDependo method]
 * @param {Function} setError [setError method]
 */
function setResult(fileName, content, setError) {
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
 * @return {String} file | false
 */
function excludeFolders(file) {
    return (foldersToExclude.length > 0 && foldersToExclude.indexOf(file) === -1) ? file : false;
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
    var dir = dirName || path.resolve(__dirname);
    foldersToExclude = arr || [];
    configFile = conf || '';
    readRequireJSModules(dir, arr, setResult, setError, generateDependo);
}
