var events = require('events');
var Promise = require('promise');
var Parse = require('parse/node');
var login = require("facebook-chat-api");
var fs = require('fs');
var conf = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var BotBrain = require("./botBrain.js");

var user = conf.user;
var chatEmitter = new events.EventEmitter();

BotBrain.start(conf).then(function(bot){ return bot.listen(); }).then(function(blob){
  var bot = blob.bot;
  var event = blob.event;
  switch(event.type) {
    case "message":
      debugger;
      chatEmitter.emit('message', {event:event, bot:bot})
      break;
    case "event":
      debugger;
      chatEmitter.emit('event', {event:event, bot:bot})
      break;
  }
});

chatEmitter.on('message', function(blob){
  var event = blob.event;
  var bot = blob.bot;
  if(bot.isAllowed(event)) {
    bot.joinThread(event);
    bot.respond(event);
  } else {
    bot.whittyError(event);
  }
});