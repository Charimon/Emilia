var events = require('events');
var Promise = require('promise');
var Parse = require('parse/node');
var login = require("facebook-chat-api");
var fs = require('fs');
var conf = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var BotBrain = require("./botBrain.js");
var Conversation = require('./conversation.js')

var user = conf.user;
Parse.initialize(conf.parse.applicationId, conf.parse.jsKey);

// var chatEmitter = new events.EventEmitter();

// BotBrain.start(conf).then(function(bot){
//   bot.api.listen(function(err, event) {
//     if(err) return console.error(err);
    
//     switch(event.type) {
//       case "message":
//         chatEmitter.emit('message', {event:event, bot:bot})
//         break;
//       case "event":
//         chatEmitter.emit('event', {event:event, bot:bot})
//         break;
//     }
//   });
// });

// chatEmitter.on('message', function(blob){
//   var event = blob.event;
//   var bot = blob.bot;
  
//   debugger
  
//   if(!bot.isAllowed(event)) {
//     bot.whittyError(event);
//     return;
//   }
  
//   debugger
//   if(bot.isIndividualConvo(event)) {
//     bot.individualRespond(event);
//   } else {
//     bot.joinThread(event);
//     bot.respond(event);
//   }
  
// });

var listening = (event, conversation) => {
  console.log(event)
  console.log(conversation.participants)
}

var botBrain = new BotBrain();
botBrain.start(conf.user.email, conf.user.password, listening);