var events = require('events');
var Promise = require('promise');
var Parse = require('parse/node');
var login = require("facebook-chat-api");
var fs = require('fs');
var conf = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var BotBrain = require("./botBrain.js");

var user = conf.user;
var chatEmitter = new events.EventEmitter();

function start() {
  return new Promise(function(resolve, reject){
    login({email: user.email, password: user.password}, function callback (err, api) {
      if(err) { reject(err); }
      else {
        api.setOptions({listenEvents: true});
        resolve(api);
      }
    });
  });
}
function listen(api) {
  return new Promise(function(resolve, reject){
    // var stopListening =
    api.listen(function(err, event) {
      if(err) { reject(err); }
      else { resolve(event); }
    });
  });
}

start().then(function(api){
  var bot = new BotBrain(api, conf);
  listen(api).then(function(event){
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
  console.log("event");
  if(bot.isAllowed(event)) {
    bot.joinThread(event);
    bot.respond(event);
  } else {
    bot.whittyError(event);
  }
});