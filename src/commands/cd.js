
// returns the new directory after cd is executed
var fs = require('fs'),
    path = require('path');

module.exports = function(api, directory, relativeDir, threadID){
  try {
    var stat = fs.statSync(path.join(directory, relativeDir));
    if (stat.isDirectory()) {
      var newDir = path.join(directory, relativeDir);
      api.sendMessage('@fbash\n' + newDir, threadID);
      return newDir;
    }else {
      api.sendMessage('@fbash ERR:\nThe specified path does not point to a '
      	+'directory.', threadID);
    }
  } catch (e) {
  	api.sendMessage('@fbash\nThe system could not find the path specified.',
     threadID);
  }
  return directory;
}