var fs = require('fs'),
    path = require('path'),
    wrench = require('wrench'),
    chalk = require('chalk'),
    requirejs = require('requirejs'),
    //requirejsText = require('requirejs-text'),
    foldersToRemove = null;

function removeFolders(file) {
    var i = 0,
        arrLength = foldersToRemove.length,
        result;

    for (i; i < arrLength; i++) {
        if (file.indexOf(foldersToRemove[i]) === -1) {
            result = file;
        } else {
            result = false;
        }
    }
    return (result) ? result : false;
}

function returnJSfiles(file) {
    return (file.indexOf('.json') === -1 && file.indexOf('.jsq') === -1 && file.indexOf('node_modules') === -1 && file.indexOf('.git') === -1 && file.indexOf('.js') !== -1) ? file : false;
}

function readRequireJSModules(dirName, arr, setResult, onError) {
    var files = wrench.readdirSyncRecursive(dirName).filter(returnJSfiles).filter(removeFolders);

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
    } else {
        setError('The directory is empty');
    }
}

function setResult(fileName, content) {
    if (content.indexOf('define') !== -1 || content.indexOf('require') !== -1) {
        console.log(fileName);
    }
}

function setError(err) {
    //console.log(err);
}

module.exports = function(dirName, arr) {
    var dir = dirName || path.resolve(__dirname);
    foldersToRemove = arr;
    readRequireJSModules(dir, arr, setResult, setError);
}
