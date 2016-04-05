#!/usr/bin/env node

// if appstate has not already been saved, prompts user for credentials and saves appstate
// runs fbterm as a daemon using forever

var forever = require('forever'),
	readlineSync = require('readline-sync'),
	fs = require('fs'),
	login = require('facebook-chat-api');

fs.stat(__dirname+"\\appstate.json", function(err, stat) { //check if file exists
    if(err == null) {
    	launch();
    }else{
    	var loginInfo = {};
		loginInfo.email = readlineSync.question('email:');
		 
		loginInfo.password = readlineSync.question('password: ', {
		  hideEchoBack: true // The typed text on screen is hidden by `*` (default). 
		});

		login(loginInfo,{logLevel: "silent"}, function(err,api){
			if(err) {
				console.log("Invalid credentials.");
			}
			else {
				fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
				launch();
			}
		});

    }
}); 


function launch(){
	forever.startDaemon('./index.js', {
	    "uid": "fbterm",
	    "append": true,
	    "script": "index.js",
	    "sourceDir": __dirname
	});
	console.log("Started fbterm.")
}