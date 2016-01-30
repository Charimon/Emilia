var events = require('events');
var Promise = require('promise');
var Parse = require('parse/node');
var login = require("facebook-chat-api");
var fs = require('fs');
var conf = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var BotBrain = require("./botBrain.js");

var user = conf.user;
var chatEmitter = new events.EventEmitter();

BotBrain.start(conf).then(function(bot){
  bot.api.listen(function(err, event) {
    if(err) return console.error(err);
    
    switch(event.type) {
      case "message":
        chatEmitter.emit('message', {event:event, bot:bot})
        break;
      case "event":
        chatEmitter.emit('event', {event:event, bot:bot})
        break;
    }
  });
});

chatEmitter.on('message', function(blob){
  var event = blob.event;
  var bot = blob.bot;
  
  debugger
  
  if(!bot.isAllowed(event)) {
    bot.whittyError(event);
    return;
  }
  
  debugger
  if(bot.isIndividualConvo(event)) {
    bot.individualRespond(event);
  } else {
    bot.joinThread(event);
    bot.respond(event);
  }
  
});