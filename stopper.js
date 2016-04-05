#!/usr/bin/env node
var forever = require('forever');

forever.list(false, function(err, data){
	for(var i = 0; i < data.length; i++){
		if(data[i].uid == "fbterm")
			forever.stop(i);
	}
	console.log("fbterm stopped.");
});