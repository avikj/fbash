#!/usr/bin/env node

// if appstate has not already been saved,
// prompts user for credentials and saves appstate
// runs fbash as a daemon using forever

var forever = require('forever');
var readlineSync = require('readline-sync');
var fs = require('fs');
var login = require('facebook-chat-api');
var path = require('path');
var homedir = require('homedir')();

// if fbash processes are already running, stop them
forever.list(false, function(err, data) {
  if (err) throw err;
  if (data == null) return;
  for (var i = 0; i < data.length; i++) {
    if (data[i].uid === 'fbash'){
      forever.stop(i);
    }
  }
});

var fbashDir = path.join(homedir, '.fbash');

// ensures that the .fbash/ directory exists in the correct location
if (!fs.existsSync(fbashDir)) {
  fs.mkdirSync(fbashDir);
}

// ensures that the settings.json file exists in the correct location
fs.stat(path.join(fbashDir, 'settings.json'), function(err, stat) { 
  if (err == null) return;
  
  var defaultSettings = {
    periodReplacement: '.'
  };

  var defaultSettingsStr = JSON.stringify(defaultSettings);
  fs.writeFileSync(path.join(fbashDir, 'settings.json'), defaultSettingsStr);
});

// if there is not a saved appstate, prompt user to log in and save state
fs.stat(path.join(fbashDir, 'appstate.json'), function(err, stat) {
  if (err == null) {
    launch();
  } else {
    var loginInfo = {};
    loginInfo.email = readlineSync.question('email: ');

    loginInfo.password = readlineSync.question('password: ', {
      hideEchoBack: true
    });

    login(loginInfo, {
      logLevel: 'silent'
    }, function(err, api) {
      if (err) {
        console.log(err);
        console.log('Invalid credentials.');
      } else {

        try {
          var appStateStr = JSON.stringify(api.getAppState());
          fs.writeFileSync(path.join(fbashDir, 'appstate.json'), appStateStr);
        } catch (e) {
          console.log(e)
        }
        launch();
      }
    });
  }
});


function launch() {
  forever.startDaemon('index.js', {
    'uid': 'fbash',
    'script': 'index.js',
    'sourceDir': __dirname,
    'logFile': path.join(fbashDir, 'forever.log'),
    'outFile': path.join(fbashDir, 'out.log'),
    'errFile': path.join(fbashDir, 'err.log')
  });
  console.log('Started fbash.');
}
