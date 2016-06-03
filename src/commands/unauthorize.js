module.exports = function(api, args, authorizedThreads, threadID){
  if(args.length != 1) {
    api.sendMessage('@fbash ERR:\nThe syntax of the command is incorrect.');
    return;
  }
  if(threadID == api.getCurrentUserID()){
    api.sendMessage('@fbash ERR:\nAuthorization is permanently enabled for this thread.', threadID);
    return;
  }
  if(!authorizedThreads[threadID]){
    api.sendMessage('@fbash\nThis thread was not previously authorized to send commands.');
    return;
  }
  authorizedThreads[threadID] = false;
  api.sendMessage('@fbash\nOther users can no longer send commands through this thread.', threadID);
}