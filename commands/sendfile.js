var fs = require('fs');

// ensure that file exists before sending
module.exports = function(api, filePath, threadID){
  fs.stat(filePath, function statCallback(err, stat) {
    if (err == null) {
      if(stat.isDirectory()){
        api.sendMessage('@fbash ERR:\nThe specified path points to a directory.', threadID);
        return;
      }
      api.sendMessage({
        body: '@fbash',
        attachment: fs.createReadStream(filePath)
      }, threadID);
    } else if (err.code === 'ENOENT') {
      api.sendMessage('@fbash ERR:\nNo such file or directory: ' + filePath,
        threadID);
    } else {
      console.log('Some other error: ', err.code);
    }
  });
}