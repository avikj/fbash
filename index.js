var login = require("facebook-chat-api"),
    fs = require('fs'),
    exec = require('child_process').exec;

var loginInfo = JSON.parse(fs.readFileSync("secretData.json"));
var cds = [];
login(loginInfo, function callback (err, api) {
    if(err) return console.error(err);
    api.setOptions({selfListen: true});

    api.listen(function callback(err, message) {
    	//if(message.senderID != message.threadID) // do not accept messages from group chats
    	  //  return; 
        if(message.senderID != api.getCurrentUserID()) // do not accept messages from other people
    	    return;
        if(message.body.startsWith("@fbterm"))	// do not accept messages that were sent by the bot
    	    return;
    	if(message.body.indexOf("cd") != -1){
    		console.log(message.body);
    		cds.push(message.body+" && ");
            var command = "";
            for(var i = 0; i < cds.length; i++)
                command+=cds[i];
            command+="pwd";
            exec(command, function(error, stdout, stderr){
                api.sendMessage("@fbterm\n"+stdout, message.threadID);
            });
            return;
    	}
        	
    	var command = "";
    	for(var i = 0; i < cds.length; i++)
    		command+=cds[i];
    	command+=message.body;
    	console.log(command);

    	exec(command, function(error, stdout, stderr){
    		
    		if(error)
    			api.sendMessage("@fbterm\n"+error.toString(), message.threadID);
    		else
    			api.sendMessage("@fbterm\n"+stdout+"\n"+stderr, message.threadID);
    	});
    	    
    });
});
