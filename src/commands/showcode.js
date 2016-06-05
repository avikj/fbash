var fs = require('fs'),
    path = require('path'),
    replacePeriods = require('../utils/replacePeriods.js'),
    getFileType = require('../utils/getFileType.js');

module.exports = function(api, relativeFilePath, language, directory, threadID, periodReplacement){
  if(!relativeFilePath){
    api.sendMessage('@fbash\nNo file specified.', threadID);
    return
  }
  var filePath = path.join(directory, relativeFilePath);

  // ensure that file exists before sending
  fs.stat(filePath, function statCallback(err, stat) {
    if (err == null) {
      if(stat.isDirectory()){
        api.sendMessage('@fbash ERR:\n'
        	+'The specified path points to a directory.', threadID);
        return;
      }

      var fileData = replacePeriods(fs.readFileSync(filePath, 'utf8'),
      	periodReplacement);

      var fileType = language ? language : getFileType(filePath);

      api.sendMessage('@fbash\n```'+fileType
        +'\n'+fileData+'```', threadID);

    } else if (err.code === 'ENOENT') {
      api.sendMessage('@fbash ERR:\nNo such file or directory: ' + filePath,
        threadID);
    } else {
      console.log('Some other error: ', err.code);
    }
  });
}