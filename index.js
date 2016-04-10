#!/usr/bin/env node

var login = require("facebook-chat-api"),
    fs = require('fs'),
    exec = require('child_process').exec,
    path = require('path'),
    homedir = require('homedir')(),
    moment = require('moment');


var cds = [];

var lastMessage = "";

var directory = homedir;
var settings = JSON.parse(fs.readFileSync(path.join(homedir, '.fbash', "settings.json"), 'utf8'));
var loginInfo = {appState: JSON.parse(fs.readFileSync(path.join(homedir,".fbash", "appstate.json")))};

console.log(homedir);
login(loginInfo,{logLevel: "silent"},function callback (err, api) {

    if(err){
        fs.unlinkSync(path.join(homedir, '.fbash', 'appstate.json')); // delete appstate.json if it is no longer valid
        return console.error(err);
    }
    console.log("Logged in.");

    api.changeNickname("fbash", api.getCurrentUserID(), api.getCurrentUserID(), function(err){});   // set user's message-to-self nickname to 'fbash'
    api.sendMessage("@fbash connected @ "+moment().format('MM/DD/YY, hh:mm:ss a'), api.getCurrentUserID());
    api.setOptions({selfListen: true});

    api.listen(function callback(err, message) {
    	if(!message.body)	// prevent errors when message only contains attachment, without a message body
	    return;
	
	if(api.getCurrentUserID() != message.threadID) // do not accept messages from group chats unless preceded by '/fbash'
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
    	lastMessage = message.body;
	
	message.body = message.body.trim();

	// handle fbash settings
	if(message.body.startsWith('/set ')){
		var args = message.body.substring(5).split(" ");
		if(args.length != 2){
			api.sendMessage("@fbash\nThe syntax of the command is incorrect.", message.threadID);
			return;
		}
		settings[args[0]] = args[1];
		api.sendMessage("@fbash\nSet value of '"+args[0]+"' to '"+args[1]+"'", message.threadID); 
		saveSettings();
		return;
	}

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
        	
    	exec(message.body, {
            cwd: directory
        }, function(error, stdout, stderr){
                stdout = stdout.replace(/\./g, settings.periodReplacement);     // replaces periods with other character to prevent fb bot detection
    		if(error)
    			api.sendMessage("@fbash ERR:\n"+error, message.threadID);
    		else{
	    		api.sendMessage("@fbash\n"+stdout+"\n"+stderr, message.threadID, function(err, messageInfo){
			if(err.errorSummary == "Security Check Required"){
				api.sendMessage("@fbash\nError: Facebook detected the response as spam and blocked the stdout response.\n"
						+ "This is likely because the stdout response included periods in file names, which caused the spam filter to detect it as an unsafe or spammy link.\n"
						+ "You can prevent this from happening again by enabling the setting to replace periods with another symbol. The syntax to replace periods with commas "
						+ "is as follows:\n\n/set periodReplacement ,\n\nIf you prefer another symbol over a comma, you can just replace the comma in the example command with your preferred character.", message.threadID);
				}		
			});
	    	}
    	});
    	    
    });
});


function saveSettings(){
	fs.writeFileSync(path.join(homedir, '.fbash', "settings.json"), JSON.stringify(settings));
}
