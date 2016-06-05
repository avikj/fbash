#!/usr/bin/env node

// appstate should already be saved before index.js is run
// should be launched from starter.js in production

// require installed node modules
var login = require('facebook-chat-api');
var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var moment = require('moment');
var homedir = require('homedir');
var stringToArgv = require('string-argv');

// require utility functions
var replacePeriods = require('./utils/replacePeriods.js');
var equalAttachments = require('./utils/equalAttachments.js');
// require command functions
var clear = require('./commands/clear.js');
var sendfile = require('./commands/sendfile.js');
var savefile = require('./commands/savefile.js');
var showcode = require('./commands/showcode.js');
var cd = require('./commands/cd.js');
var authorize = require('./commands/authorize.js');
var unauthorize = require('./commands/unauthorize.js');

var directory = homedir();

var lastMessage = {};
var lastFileAttachment = {};

var authorizedThreads = {};

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

    if (message.senderID != api.getCurrentUserID() && !authorizedThreads[message.threadID]) // either the sender is the current user or someone in an authorized thread
      return;

    // do not accept messages that were sent by the bot
    if (message.body && message.body.startsWith('@fbash'))
      return;

    // do not accept messages from group chats unless preceded by '/fbash'
    if (message.body && api.getCurrentUserID() != message.threadID) {
      if (message.body.startsWith('/fbash')) {
        message.body = message.body.substring(7);
      }
      else {
        return;
      }
    }
    else{
      // for some reason the api recieves each message to oneself exactly twice,
      // so filter duplicate messages
      if (lastMessage.body === message.body && equalAttachments(lastMessage.attachments, message.attachments)) { 
        lastMessage = {};
        return;
      }
      lastMessage = message;
    }

    if(message.attachments && message.attachments.length > 0 && message.attachments[0].type == 'file'){
      lastFileAttachment = message.attachments[0];
      console.log(JSON.stringify(lastFileAttachment));
    }

    if (!message.body) 
      return;

    message.body = message.body.trim();

    var argv = stringToArgv(message.body);

    // handle fbash settings
    if (argv[0] == "/set") {
      if (argv.length != 3) {
        api.sendMessage('@fbash\nThe syntax of the command is incorrect.', 
            message.threadID);
        return;
      }
      settings[args[1]] = args[2];
      api.sendMessage('@fbash\nSet value of \'' + args[1] 
        + '\' to \'' + args[2] + '\'', message.threadID);

      saveSettings();
      return;
    }

    // clears thread
    if (argv[0] == 'cls' || argv[0] == 'clear' || argv[0] == 'reset') {
      clear(api, message.threadID);
      return;
    }
    
    // sends a file as an attachment
    if (argv[0] == 'sendfile') {
      var filePath = argv[1] ? path.join(directory, argv[1]) : null;
      sendfile(api, filePath, message.threadID);
      return;
    }

    if(argv[0] == 'savefile') {
      var filePath = path.join(directory, argv[1] ? argv[1] : '.');
      savefile(api, filePath, lastFileAttachment, message.threadID);
      return;
    }

    if (argv[0] == 'showcode') {
      showcode(api, argv[1], argv[2], directory, 
        message.threadID, settings.periodReplacement);
      return;
    }

    if (argv[0] == 'cd') {
      var relativeDir = argv[1];
      directory = cd(api, directory, relativeDir, message.threadID);
      return;
    }

    if(argv[0] == 'authorize') {
      authorize(api, authorizedThreads, message.threadID);
      return;
    }

    if(argv[0] == 'unauthorize') {
      unauthorize(api, authorizedThreads, message.threadID);
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
  fs.writeFileSync(path.join(homedir(), '.fbash', 'settings.json'),
    JSON.stringify(settings));
}
