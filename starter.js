#!/usr/bin/env node

// if appstate has not already been saved, prompts user for credentials and saves appstate
// runs fbash as a daemon using forever

var forever = require('forever'),
	readlineSync = require('readline-sync'),
	fs = require('fs'),
	login = require('facebook-chat-api'),
	path = require('path'),
	homedir = require('homedir')();

// if fbash processes are already running, stop them
forever.list(false, function(err, data){
	if(err) throw err;
	if(data == null)return;
	for(var i = 0; i < data.length; i++){
		if(data[i].uid == "fbash")
			forever.stop(i);
	}
});

var fbashDir = path.join(homedir, '.fbash');

if (!fs.existsSync(fbashDir)){
	fs.mkdirSync(fbashDir);
}

fs.stat(path.join(fbashDir, "settings.json"), function(err, stat) { //check if file exists
    if(err == null)
    	return;
    var defaultSettings = {
    	replacePds: false,
    };

    fs.writeFileSync(path.join(fbashDir, "settings.json"), JSON.stringify(defaultSettings));
}); 

fs.stat(path.join(fbashDir, "appstate.json"), function(err, stat) { //check if file exists
    if(err == null) {
    	launch();
    }else{
    	var loginInfo = {};
		loginInfo.email = readlineSync.question('email: ');
		 
		loginInfo.password = readlineSync.question('password: ', {
		  hideEchoBack: true // The typed text on screen is hidden by `*` (default). 
		});

		login(loginInfo,{logLevel: "silent"}, function(err,api){
			if(err) {
				console.log(err);
				console.log("Invalid credentials.");
			}
			else {
				
				try{fs.writeFileSync(path.join(fbashDir, 'appstate.json'), JSON.stringify(api.getAppState()));
				}catch(e){console.log(e)}
					launch();
			}
		});

    }
}); 


function launch(){
	forever.startDaemon('index.js', {
	    "uid": "fbash",
	    "script": "index.js",
	    "sourceDir": __dirname,
	    "logFile": path.join(fbashDir, 'forever.log'),
	    "outFile": path.join(fbashDir, 'out.log'),
	    "errFile": path.join(fbashDir, 'err.log')
	});
	console.log("Started fbash.")
}
