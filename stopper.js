#!/usr/bin/env node

var forever = require('forever');

forever.list(false, function(err, data){
  if(data == null) return;
  for(var i = 0; i < data.length; i++){
    if(data[i].uid === 'fbash'){
      forever.stop(i);
    }
  }
  console.log('fbash stopped.');
});
