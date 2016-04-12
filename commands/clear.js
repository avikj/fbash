module.exports = function(api, threadID){
  api.sendMessage('@fbash\nReload page to finish clearing thread.', 
    threadID, function messageSent(err, messageInfo) {
    api.deleteThread(threadID);
  });
}