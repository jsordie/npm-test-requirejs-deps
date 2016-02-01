var fs = require('fs');
var data = {};

function readRequireJSModules(dirName, setResult, onError) {
    var parentDir = dirName;

    if (dirName && dirName !== 'node_modules') {
        (function travelDir(dir) {
            var directory = dir || dirName;
            fs.readdir(directory, function(err, fileNames) {
                if (err) {
                    onError(err);
                    return;
                }

                fileNames.forEach(function(fileName) {
                    if (fileName.indexOf('.js') !== -1) {
                        fs.readFile(directory + '/' + fileName, 'utf-8', function(err, content) {
                            if (err) {
                                onError(err);
                                return;
                            }
                            setResult(fileName, content);
                        });
                    } else {
                        if (fs.lstatSync(fileName).isDirectory() && fileName !== 'node_modules' && fileName !== '.git') {
                            if (parentDir === '.') {
                                parentDir = fileName;
                                travelDir(parentDir);
                            } else {
                                parentDir += '/' + fileName;
                                travelDir(parentDir);
                            }
                        } else {
                            return;
                        }
                    }
                });
            });
        }(dirName));
    } else {
        var errorMessage = 'Your directory name is empty';
        setError(errorMessage);
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
    var dir = dirName || '.';
    readRequireJSModules(dir, setResult, setError);
}
