#!/usr/bin/env node

// require installed node modules
var login = require('facebook-chat-api');
var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var moment = require('moment');
var directory = require('homedir')();

// require utility functions
var replacePeriods = require('./utils/replacePeriods.js');

// require command functions
var clear = require('./commands/clear.js');
var sendfile = require('./commands/sendfile.js');
var showcode = require('./commands/showcode.js');
var cd = require('./commands/cd.js');

var lastMessage = '';

var settings = JSON.parse(
    fs.readFileSync(path.join(directory, '.fbash', 'settings.json'), 'utf8')
);

var loginInfo = {
  appState: 
    JSON.parse(fs.readFileSync(path.join(directory, '.fbash', 'appstate.json')))
};

console.log(directory);
login(loginInfo, {
  logLevel: 'silent'
}, function loggedIn(err, api) {

  // delete appstate.json if it is no longer valid
  if (err) {
    fs.unlinkSync(path.join(directory, '.fbash', 'appstate.json')); 
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
    if(err)
      return console.error(err);
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
      clear(api, message.threadID);
      return;
    }
    
    // sends a file as an attachment
    if (message.body.startsWith('sendfile ')) {
      var filePath = path.join(directory, message.body.substring(9));
      sendfile(api, filePath, message.threadID);
      return;
    }

    if (message.body.startsWith('showcode ')) {
      var args = message.body.substring(9).split(' ');
      showcode(api, args, directory, 
        message.threadID, settings.periodReplacement);
      return;
    }

    if (message.body.startsWith('cd ')) {
      var relativeDir = message.body.substring(3);
      directory = cd(api, directory, relativeDir, message.threadID);
      return;
    }

    exec(message.body, {
      cwd: directory
    }, function(error, stdout, stderr) {

      // replaces periods in response with another character
      // to bypass Facebook's spam detection
      stdout = replacePeriods(stdout, settings.periodReplacement);
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
});

function saveSettings() {
  fs.writeFileSync(path.join(directory, '.fbash', 'settings.json'),
    JSON.stringify(settings));
}
