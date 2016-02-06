var fs = require('fs'),
    path = require('path'),
    wrench = require('wrench'),
    chalk = require('chalk'),
    Dependo = require('dependo'),
    foldersToExclude,
    configFile;

function excludeFolders(file) {
    var i = 0,
        arrLength = foldersToExclude.length,
        result;

    for (i; i < arrLength; i++) {
        if (file.indexOf(foldersToExclude[i]) === -1) {
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

function generateDependo(file) {
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

function setResult(fileName, content) {
    if (content.indexOf('define(') !== -1 || content.indexOf('require(') !== -1) {
        generateDependo(fileName);
    }
}

function setError(err) {
    chalk.red(console.log(err));
}

module.exports = function(dirName, arr, conf) {
    var dir = dirName || path.resolve(__dirname);
    foldersToExclude = arr;
    configFile = conf;
    readRequireJSModules(dir, arr, setResult, setError);
}
