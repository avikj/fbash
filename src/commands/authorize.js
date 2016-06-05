module.exports = function(api, authorizedThreads, threadID){
  if(threadID == api.getCurrentUserID()){
    api.sendMessage('@fbash ERR:\nAuthorization is already permanently enabled for this thread.', threadID);
    return;
  }
  authorizedThreads[threadID] = true;
  api.sendMessage('@fbash\nCommands can now be sent by any user in this thread through this thread.', threadID);
}