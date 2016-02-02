var fs = require('fs');
var path = require('path');
var wrench = require('wrench');
var chalk = require('chalk');
var data = {};

function readRequireJSModules(dirName, setResult, onError) {
    var files = wrench.readdirSyncRecursive(dirName);

    if (dirName) {
        files.forEach(function(file) {
            if (file.indexOf('node_modules') === -1 && file.indexOf('.git') === -1 && file.indexOf('coverage') === -1 && file.indexOf('.js') !== -1) {
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
    if (content.indexOf('define') !== -1) {
        console.log(fileName);
    }
}

function setError(err) {
    console.log(err);
}

module.exports = function(dirName) {
    var dir = dirName || path.resolve(__dirname);
    readRequireJSModules(dir, setResult, setError);
}
