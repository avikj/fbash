#!/usr/bin/env node

var login = require('facebook-chat-api');
var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var homedir = require('homedir')();
var moment = require('moment');

var getFileType = require('./utils/getFileType.js');

var lastMessage = '';

var directory = homedir;

var settings = JSON.parse(
    fs.readFileSync(path.join(homedir, '.fbash', 'settings.json'), 'utf8')
);

var loginInfo = {
  appState: 
    JSON.parse(fs.readFileSync(path.join(homedir, '.fbash', 'appstate.json')))
};

console.log(homedir);
login(loginInfo, {
  logLevel: 'silent'
}, function loggedIn(err, api) {

  // delete appstate.json if it is no longer valid
  if (err) {
    fs.unlinkSync(path.join(homedir, '.fbash', 'appstate.json')); 
    return console.error(err);
  }

  // set user's message-to-self nickname to 'fbash'
  api.changeNickname('fbash', api.getCurrentUserID(), 
    api.getCurrentUserID(), function(err){});

  // notfy user that fbash has connected
  var timestamp = moment().format('MM/DD/YY, hh:mm:ss a');
  api.sendMessage('@fbash connected at '+timestamp, api.getCurrentUserID());

  // enable listening to logged in user's messages
  api.setOptions({
    selfListen: true
  });

  api.listen(function onMessage(err, message) {
    // prevent errors when message does not contain body
    if (!message.body) 
      return;

    if (message.senderID != api.getCurrentUserID())
      return;

    // do not accept messages that were sent by the bot
    if (message.body.startsWith('@fbash'))
      return;

    // do not accept messages from group chats unless preceded by '/fbash'
    if (api.getCurrentUserID() != message.threadID) {
      if (message.body.startsWith('/fbash')) {
        message.body = message.body.substring(7);
      }
      else {
        return;
      }
    }

    // for some reason the api recieves each message to oneself exactly twice,
    // so filter duplicate messages
    if (lastMessage === message.body) { 
      lastMessage = '';
      return;
    }
    lastMessage = message.body;

    message.body = message.body.trim();

    // handle fbash settings
    if (message.body.startsWith('/set ')) {
      var args = message.body.substring(5).split(' ');
      if (args.length != 2) {
        api.sendMessage('@fbash\nThe syntax of the command is incorrect.', 
            message.threadID);

        return;
      }
      settings[args[0]] = args[1];
      api.sendMessage('@fbash\nSet value of \'' + args[0] 
        + '\' to \'' + args[1] + '\'', message.threadID);

      saveSettings();
      return;
    }

    // clears thread
    if (message.body === 'cls' || message.body === 'clear') { 
      api.sendMessage('@fbash\nReload page to finish clearing thread.', 
        message.threadID, function messageSent(err, messageInfo) {
        api.deleteThread(message.threadID);
      });
      return;
    }

    if (message.body.startsWith('sendfile ')) {
      var fileName = message.body.substring(9);

      // ensure that file exists before sending
      fs.stat(path.join(directory, fileName), function statCallback(err, stat) {
        if (err == null) {
          if(stat.isDirectory()){
            api.sendMessage('The specified path points to a directory.', message.threadID);
            return;
          }
          api.sendMessage({
            body: '@fbash',
            attachment: fs.createReadStream(path.join(directory, fileName))
          }, message.threadID);
        } else if (err.code === 'ENOENT') {
          api.sendMessage('@fbash ERR:\nNo such file or directory: ' + fileName,
            message.threadID);
        } else {
          console.log('Some other error: ', err.code);
        }
      });
      return;
    }

    if (message.body.startsWith('showcode ')) {
      var args = message.body.substring(9).split(' ');
      if(args.length == 0){
        api.sendMessage('@fbash\nNo file specified.', message.threadID);
        return
      }
      var fileName = args[0];

      // ensure that file exists before sending
      fs.stat(path.join(directory, fileName), function statCallback(err, stat) {
        if (err == null) {
          if(stat.isDirectory()){
            api.sendMessage('The specified path points to a directory.'
                , message.threadID);
            return;
          }

          var fileData = replacePeriods(fs.readFileSync(
            path.join(directory, fileName), 'utf8'));

          var fileType = getFileType(fileName);
          console.log('sent file '+fileName+' with file type '+fileType);

          api.sendMessage('@fbash\n```'+fileType
            +'\n'+fileData+'```', message.threadID);

        } else if (err.code === 'ENOENT') {
          api.sendMessage('@fbash ERR:\nNo such file or directory: ' + fileName,
            message.threadID);
        } else {
          console.log('Some other error: ', err.code);
        }
      });
      return;
    }

    if (message.body.startsWith('cd')) {
      var success = false;
      var relativeDir = message.body.substring(2).trim();
      try {
        var stat = fs.statSync(path.join(directory, relativeDir));
        if (stat.isDirectory()) {
          directory = path.join(directory, relativeDir);
          success = true;
        }
      } catch (e) {}
      if (success) {
        api.sendMessage('@fbash\n' + directory, message.threadID);
        console.log('cwd: ' + directory);
      } else {
        api.sendMessage('@fbash\nThe system could not find the path specified.',
         message.threadID);
      }
      return;
    }

    exec(message.body, {
      cwd: directory
    }, function(error, stdout, stderr) {

      // replaces periods in response with another character
      // to bypass Facebook's spam detection
      stdout = replacePeriods(stdout);
      if (error)
        api.sendMessage('@fbash ERR:\n' + error, message.threadID);
      else {
        api.sendMessage('@fbash\n' + stdout + '\n' + stderr, message.threadID,
          function sentMessage(err, messageInfo) {
          if (err.errorSummary === 'Security Check Required') {
            api.sendMessage('@fbash\nError: Facebook detected the response as '
              +'spam and blocked the stdout response.\nThis is likely because '
              +'the stdout response included periods in file names, which '
              +'caused the spam filter to detect it as an unsafe or spammy '
              +'link.\nYou can prevent this from happening again by enabling '
              +'the setting to replace periods with another symbol. The syntax'
              +' to replace periods with commas is as follows:\n\n/set '
              +'periodReplacement ,\n\nIf you prefer another symbol over a '
              +'comma, you can just replace the comma in the example command '
              +'with your preferred character.', message.threadID);
          }
        });
      }
    });
  });

  function replacePeriods(text){
    return text.replace(/\./g, settings.periodReplacement);
  }
});

function saveSettings() {
  fs.writeFileSync(path.join(homedir, '.fbash', 'settings.json'),
    JSON.stringify(settings));
}
