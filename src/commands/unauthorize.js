module.exports = function(api, authorizedThreads, threadID){
  if(threadID == api.getCurrentUserID()){
    api.sendMessage('@fbash ERR:\nAuthorization cannot be disabled for this thread.', threadID);
    return;
  }
  if(!authorizedThreads[threadID]){
    api.sendMessage('@fbash\nThis thread was not previously authorized to send commands.');
    return;
  }
  authorizedThreads[threadID] = false;
  api.sendMessage('@fbash\nOther users can no longer send commands through this thread.', threadID);
}