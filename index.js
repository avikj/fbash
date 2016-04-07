#!/usr/bin/env node
var login = require("facebook-chat-api"),
    fs = require('fs'),
    exec = require('child_process').exec,
    path = require('path'),
    homedir = require('homedir'),
    moment = require('moment');

var loginInfo = {appState: JSON.parse(fs.readFileSync(path.join(__dirname, "appstate.json")))};
var cds = [];
var lastDate = Date.now();
var lastMessage = "";

var directory = homedir();
var settings = JSON.parse(fs.readFileSync(path.join(__dirname, "settings.json"), 'utf8'));

console.log(__dirname);
login(loginInfo,{logLevel: "silent"},function callback (err, api) {

    if(err){
        fs.unlinkSync(path.join(__dirname, 'appstate.json')); // delete appstate.json if it is no longer valid
        return console.error(err);
    }
    console.log("Logged in.");

    api.changeNickname("fbash", api.getCurrentUserID(), api.getCurrentUserID(), function(err){});   // set user's message-to-self nickname to 'fbash'
    api.sendMessage("@fbash connected @ "+moment().format('MM/DD/YY, hh:mm:ss a'), api.getCurrentUserID());
    api.setOptions({selfListen: true});

    api.listen(function callback(err, message) {
    	if(message.senderID != message.threadID) // do not accept messages from group chats unless preceded by '/fbash'
    	    if(message.body.startsWith("/fbash"))
                message.body = message.body.substring(7);
            else
                return;

        if(message.senderID != api.getCurrentUserID()) // do not accept messages from other people
    	    return;

        if(message.body.startsWith("@fbash"))	// do not accept messages that were sent by the bot
    	    return;

    	if(lastMessage == message.body){	// prevent duplicate calls
            lastMessage = "";
	       return;
       }
    	lastDate = Date.now();
	   lastMessage = message.body;
    	console.log("\nexecuting command @ "+Date.now());

        if(message.body.trim() == "cls" || message.body.trim() == "clear"){     // deletes thread (clears messages)
            api.sendMessage("@fbash\nReload page to finish clearing thread.", message.threadID, function(err, messageInfo){
                api.deleteThread(message.threadID);
                api.sendMessage("@fbash :)", message.threadID);
            });
            return;
        }

         if(message.body.toLowerCase().startsWith("sendfile ")){
            var filename = message.body.substring(9).trim();
            console.log("Attempting to send file: "+filename);
            fs.stat(directory+"/"+filename, function(err, stat) { //check if file exists
                if(err == null) {
                    api.sendMessage({body: "@fbash "+filename, attachment: fs.createReadStream(directory+"/"+filename)}, message.threadID);
                    console.log('File exists');
                } else if(err.code == 'ENOENT') {
                    api.sendMessage("@fbash ERR:\nFile "+filename+" not found.", message.threadID);
                } else {
                    console.log('Some other error: ', err.code);
                }
            });
            return;
        }

    	if(message.body.trim().startsWith("cd")){
            var success = false;
            var relativeDir = message.body.trim().substring(2).trim();
            try{
                var stat = fs.statSync(path.join(directory, relativeDir));
                if(stat.isDirectory()){
                    directory = path.join(directory, relativeDir);
                    success = true;
                }
            }catch(e){}
            if(success){
                api.sendMessage("@fbash\n"+directory, message.threadID);
                console.log("cwd: "+directory);
            }else{
                api.sendMessage("@fbash\nThe system could not find the path specified.", message.threadID);
            }
            return;
    	}
        	
    	var command = "";
    	for(var i = 0; i < cds.length; i++)
    		command+=cds[i];
    	command+=message.body;
    	console.log(command);

    	exec(command, {
            cwd: directory
        }, function(error, stdout, stderr){
            if(settings.replacePds)
                stdout = stdout.replace(/\./g, ",");     // replaces periods with commas to prevent fb bot detection
    		if(error)
    			api.sendMessage("@fbash ERR:\n"+error, message.threadID);
    		else{
	    		api.sendMessage("@fbash\n"+stdout+"\n"+stderr, message.threadID);

	    		console.log("\nexecuted command: "+command+"\n"+stdout+"\n\n");
	    	}
    	});
    	    
    });
});
