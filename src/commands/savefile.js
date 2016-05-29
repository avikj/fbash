var fs = require('fs');
var https = require('https');
var path = require('path');

module.exports = function(api, filePath, lastFileAttachment, threadID){
  fs.stat(filePath, function(err, stats){
    if(!err){
      if(stats.isDirectory()){  // if the entered path is a directory, append the file name
        filePath = path.join(filePath, lastFileAttachment.name);
        var fileAlreadyExists = true;
        try {
          fs.statSync(filePath);
        } catch(e){
          fileAlreadyExists = false;
        }
        if(fileAlreadyExists){
          api.sendMessage('@fbash ERR:\nA file already exists at '+filePath
          	+'. To replace the existing file, use \'rm\' to delete the it and then call savefile again.', threadID);
          return;
        }
      }
      else{ // if a file with the name already exists, error
        api.sendMessage('@fbash ERR:\nA file already exists at '+filePath
          +'. To replace the existing file, use \'rm\' to delete the it and then call savefile again.', threadID);
        return;
      }
    }
    var file = fs.createWriteStream(filePath);
    var request = https.get(lastFileAttachment.url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(function(){
          api.sendMessage('@fbash\nFile saved at '+filePath, threadID);
        });
      });
    });
  });
}